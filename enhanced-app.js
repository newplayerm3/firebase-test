// Firebase配置已在firebase-simple.js中定义，这里不重复声明

// 全局变量
let currentUser = null;
let chatHistory = [];
let messageCount = 0;
let isTyping = false;
let chatMode = {
    detailed: true,
    context: true,
    language: 'zh'
};

// Firebase初始化已在firebase-simple.js中处理，这里不重复

// 工具函数
function showNotificationMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        min-width: 300px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease-out;
    `;
    
    // 根据类型设置颜色
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #3b82f6, #1e40af)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // 自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Firebase认证函数 - 使用改进版本
async function firebaseSignInWithGoogle() {
    try {
        showNotificationMessage('正在打开Google登录...', 'info');
        
        // 使用改进的Google登录函数
        if (window.improvedGoogleSignIn) {
            await window.improvedGoogleSignIn();
        } else {
            // 备用方案
            await fallbackGoogleSignIn();
        }
        
    } catch (error) {
        console.error('Google登录失败:', error);
        
        // 提供详细的错误信息和解决方案
        let errorMsg = '谷歌登录失败';
        let solution = '';
        
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMsg = '登录窗口被关闭';
                solution = '请重新点击Google登录按钮';
                break;
            case 'auth/popup-blocked':
                errorMsg = '浏览器阻止了登录弹窗';
                solution = '请允许弹窗并重试，或使用邮箱密码登录';
                break;
            case 'auth/network-request-failed':
                errorMsg = '网络连接失败';
                solution = '请检查网络连接后重试';
                break;
            case 'auth/internal-error':
                errorMsg = 'Firebase服务内部错误';
                solution = '请刷新页面后重试，或使用邮箱密码登录';
                break;
            default:
                if (error.message.includes('CSP')) {
                    errorMsg = '安全策略限制';
                    solution = '请刷新页面，或使用邮箱密码登录';
                } else {
                    solution = '请尝试刷新页面或使用邮箱密码登录';
                }
        }
        
        showNotificationMessage(errorMsg, 'error');
        
        if (solution) {
            setTimeout(() => {
                showNotificationMessage(`建议：${solution}`, 'info');
            }, 2000);
        }
    }
}

// 备用Google登录方案
async function fallbackGoogleSignIn() {
    if (!firebase.auth) {
        throw new Error('Firebase Auth not available');
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    
    console.log('Fallback Google登录成功:', user);
    
    await saveUserToFirestore(user, true, { method: 'google' });
    updateUserAvatar(user);
    showNotificationMessage(`欢迎，${user.displayName || user.email}！`, 'success');
    showCareer();
    
    return user;
}

async function firebaseSignInAnonymously() {
    try {
        if (!firebase.auth) {
            throw new Error('Firebase Auth not available');
        }
        
        showNotificationMessage('正在启用访客模式...', 'info');
        
        const result = await firebase.auth().signInAnonymously();
        const user = result.user;
        
        console.log('访客登录成功:', user);
        
        // 保存访客信息
        await saveUserToFirestore(user, true, { method: 'anonymous' });
        
        updateUserAvatar({
            displayName: '访客用户',
            email: 'guest@example.com',
            photoURL: null,
            uid: user.uid
        });
        
        showNotificationMessage('访客模式已启用，功能受限', 'warning');
        
        // 跳转到职业选择界面
        showCareer();
        
    } catch (error) {
        console.error('访客登录失败:', error);
        showNotificationMessage('访客模式启用失败，请重试', 'error');
    }
}

// 保存用户数据到Firestore
async function saveUserToFirestore(user, isNewUser = false, registrationData = null) {
    try {
        if (!firebase.firestore) {
            console.warn('Firestore not available, skipping user save');
            return;
        }
        
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        const userData = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (userDoc.exists && !isNewUser) {
            // 用户已存在，更新登录信息
            await userRef.update({
                ...userData,
                loginCount: firebase.firestore.FieldValue.increment(1)
            });
        } else {
            // 新用户，创建记录
            const newUserData = {
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                loginCount: 1,
                emailVerified: user.emailVerified,
                registrationMethod: registrationData?.method || 'google'
            };

            if (registrationData && registrationData.method === 'email') {
                newUserData.customDisplayName = registrationData.displayName;
            }

            await userRef.set(newUserData);
        }

        // 记录活动
        const activityType = isNewUser ? 'register' : 'login';
        await userRef.collection('activities').add({
            type: activityType,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent,
            method: registrationData?.method || 'google'
        });

        console.log(`用户${activityType}数据已保存到 Firestore`);
    } catch (error) {
        console.error('保存用户数据失败:', error);
    }
}

// 界面切换函数
function showLogin() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('careerContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'none';
}

function showCareer() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('careerContainer').style.display = 'flex';
    document.getElementById('mainContainer').style.display = 'none';
}

function showMain() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('careerContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'flex';
    
    // 添加动画效果
    setTimeout(() => {
        addScrollEffects();
        simulateDataLoading();
        initializeEnhancedChat();
    }, 100);
}

// 认证表单处理
function showLoginForm() {
    document.getElementById('loginToggle').classList.add('active');
    document.getElementById('registerToggle').classList.remove('active');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    
    loadRememberedEmail();
}

function showRegisterForm() {
    document.getElementById('registerToggle').classList.add('active');
    document.getElementById('loginToggle').classList.remove('active');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function loadRememberedEmail() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        const loginEmailInput = document.getElementById('loginEmail');
        if (loginEmailInput) {
            loginEmailInput.value = rememberedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }
}

// 登录表单提交
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            if (!email || !password) {
                showNotificationMessage('请填写邮箱和密码', 'error');
                return;
            }

            try {
                showNotificationMessage('正在登录...', 'info');
                
                if (firebase.auth) {
                    const result = await firebase.auth().signInWithEmailAndPassword(email, password);
                    const user = result.user;
                    
                    await saveUserToFirestore(user, false, { method: 'email' });
                    
                    if (rememberMe) {
                        localStorage.setItem('rememberedEmail', email);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }
                    
                    updateUserAvatar(user);
                    showNotificationMessage(`欢迎回来，${user.displayName || email}！`, 'success');
                    showCareer();
                } else {
                    throw new Error('Firebase Auth not available');
                }
                
            } catch (error) {
                console.error('登录失败:', error);
                let errorMessage = '登录失败，请重试';
                
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = '用户不存在，请先注册';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = '密码错误，请重试';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = '邮箱格式不正确';
                        break;
                }
                
                showNotificationMessage(errorMessage, 'error');
            }
        });
    }

    // 注册表单提交
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // 表单验证
            if (!name || !email || !password || !confirmPassword) {
                showNotificationMessage('请填写所有必填项', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotificationMessage('两次输入的密码不一致', 'error');
                return;
            }

            if (password.length < 6) {
                showNotificationMessage('密码长度至少6位', 'error');
                return;
            }

            try {
                showNotificationMessage('正在注册账户...', 'info');
                
                if (firebase.auth) {
                    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    const user = result.user;
                    
                    // 更新用户显示名称
                    await user.updateProfile({
                        displayName: name
                    });
                    
                    // 发送邮箱验证
                    await user.sendEmailVerification();
                    
                    await saveUserToFirestore(user, true, {
                        method: 'email',
                        displayName: name
                    });
                    
                    updateUserAvatar(user);
                    showNotificationMessage('注册成功！请检查邮箱验证链接', 'success');
                    showCareer();
                } else {
                    throw new Error('Firebase Auth not available');
                }
                
            } catch (error) {
                console.error('注册失败:', error);
                let errorMessage = '注册失败，请重试';
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = '该邮箱已被注册，请直接登录';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = '邮箱格式不正确';
                        break;
                    case 'auth/weak-password':
                        errorMessage = '密码强度不够，请使用更复杂的密码';
                        break;
                }
                
                showNotificationMessage(errorMessage, 'error');
            }
        });
    }
});

// 用户菜单功能
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function updateUserAvatar(user) {
    const userAvatar = document.getElementById('userAvatar');
    const userInitials = document.getElementById('userInitials');
    
    if (user && userAvatar && userInitials) {
        if (user.photoURL) {
            userAvatar.style.backgroundImage = `url(${user.photoURL})`;
            userAvatar.style.backgroundSize = 'cover';
            userInitials.style.display = 'none';
        } else {
            const name = user.displayName || user.email || 'User';
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            userInitials.textContent = initials;
            userInitials.style.display = 'block';
        }
        userAvatar.style.display = 'flex';
        currentUser = user;
    } else if (userAvatar) {
        userAvatar.style.display = 'none';
        currentUser = null;
    }
}

// 职业选择
function selectCareer(career) {
    console.log('Selected career:', career);
    localStorage.setItem('selectedCareer', career);
    showMain();
}

// 功能模块显示/隐藏
function showFeature(feature) {
    // 隐藏所有功能模块
    const features = document.querySelectorAll('.feature-content');
    features.forEach(f => f.classList.remove('active'));
    
    // 显示选中的功能模块
    const targetFeature = document.getElementById(feature + 'Feature');
    if (targetFeature) {
        targetFeature.classList.add('active');
    }
}

function hideFeature() {
    const features = document.querySelectorAll('.feature-content');
    features.forEach(f => f.classList.remove('active'));
}

// 设置功能
function showSettings() {
    showNotificationMessage('设置功能开发中...', 'info');
}

// 用户菜单功能
function showUserProfile() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('show');
    showNotificationMessage('个人资料功能开发中...', 'info');
}

function showUserSettings() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('show');
    showNotificationMessage('账户设置功能开发中...', 'info');
}

function showUserProgress() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('show');
    showNotificationMessage('学习进度功能开发中...', 'info');
}

function showUserBookmarks() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('show');
    showNotificationMessage('我的收藏功能开发中...', 'info');
}

function confirmLogout() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('show');
    
    if (confirm('确定要退出登录吗？')) {
        handleLogout();
    }
}

async function handleLogout() {
    try {
        showNotificationMessage('正在退出登录...', 'info');
        
        if (firebase.auth) {
            await firebase.auth().signOut();
        }
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberedEmail');
        updateUserAvatar(null);
        showLogin();
        showNotificationMessage('已成功退出登录', 'success');
        
    } catch (error) {
        console.error('退出登录失败:', error);
        showNotificationMessage('退出登录失败，请重试', 'error');
    }
}

// 搜索功能
function initSearch() {
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query.length > 0) {
                    performSearch(query);
                }
            }
        });
    }
}

function performSearch(query) {
    console.log('Performing search:', query);
    showNotificationMessage(`搜索功能开发中，搜索词：${query}`, 'info');
}

// 大学信息显示 - 优化弹窗版本
function showUniversityInfo(university) {
    const universityData = {
        auckland: {
            name: '奥克兰大学',
            flag: '🇳🇿',
            country: '新西兰',
            description: '奥克兰大学是新西兰排名第一的大学，也是南半球最重要的研究型大学之一。成立于1883年，是新西兰最大的综合性大学，在工程、医学、商科等领域享有国际声誉。',
            ranking: '世界排名 #68',
            programs: '商科、医学、工程、艺术设计、教育',
            admission: '本科要求：雅思6.0+，优秀的高中成绩',
            website: 'https://www.auckland.ac.nz',
            tuition: '约 NZ$32,000-45,000/年',
            location: '奥克兰，新西兰',
            students: '约 40,000 名学生',
            highlights: ['QS世界排名前100', '新西兰最大规模', '国际学生友好', '就业率高']
        },
        harvard: {
            name: '哈佛大学',
            flag: '🇺🇸',
            country: '美国',
            description: '哈佛大学是世界一流的私立研究型大学，常春藤盟校成员，培养了众多杰出人才。成立于1636年，是美国历史最悠久的高等学府，在全球享有最高的学术声誉。',
            ranking: '世界排名 #1',
            programs: '文理、科学、工程、医学、法学、商学',
            admission: '本科要求：高SAT/ACT分数，优秀的综合素质',
            website: 'https://www.harvard.edu',
            tuition: '约 $54,000-75,000/年',
            location: '剑桥，马萨诸塞州',
            students: '约 23,000 名学生',
            highlights: ['常春藤盟校', '诺贝尔奖得主最多', '全球声誉第一', '校友网络强大']
        },
        cambridge: {
            name: '剑桥大学',
            flag: '🇬🇧',
            country: '英国',
            description: '剑桥大学是英国最古老的大学之一，与牛津大学并称"牛剑"，世界顶级学府。成立于1209年，是英语世界第二古老的大学，在数学、物理、医学等领域处于世界领先地位。',
            ranking: '世界排名 #2',
            programs: '自然科学、工程、医学、人文社科',
            admission: '本科要求：高A-Level成绩，优秀的面试表现',
            website: 'https://www.cam.ac.uk',
            tuition: '约 £25,000-35,000/年',
            location: '剑桥，英国',
            students: '约 24,000 名学生',
            highlights: ['800年历史', '牛顿母校', '学院制传统', '学术声誉卓著']
        }
    };

    const uni = universityData[university];
    if (!uni) return;

    // 创建弹窗模态框
    const modal = document.createElement('div');
    modal.className = 'university-modal-overlay';
    modal.innerHTML = `
        <div class="university-modal">
            <div class="university-modal-header">
                <div class="university-header-info">
                    <div class="university-flag-large">${uni.flag}</div>
                    <div class="university-title-section">
                        <h2>${uni.name}</h2>
                        <p class="university-ranking">${uni.ranking}</p>
                    </div>
                </div>
                <button class="university-modal-close" onclick="closeUniversityModal()">&times;</button>
            </div>
            
            <div class="university-modal-content">
                <div class="university-info-grid">
                    <div class="university-basic-info">
                        <h3>📍 基本信息</h3>
                        <div class="info-item">
                            <span class="info-label">🌍 国家地区：</span>
                            <span class="info-value">${uni.country}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">📍 具体位置：</span>
                            <span class="info-value">${uni.location}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">👥 学生人数：</span>
                            <span class="info-value">${uni.students}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">💰 学费范围：</span>
                            <span class="info-value">${uni.tuition}</span>
                        </div>
                    </div>
                    
                    <div class="university-academic-info">
                        <h3>📚 学术信息</h3>
                        <div class="info-item">
                            <span class="info-label">🎓 主要专业：</span>
                            <span class="info-value">${uni.programs}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">📋 录取要求：</span>
                            <span class="info-value">${uni.admission}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">🌐 官方网站：</span>
                            <span class="info-value">
                                <a href="${uni.website}" target="_blank" class="university-link">${uni.website}</a>
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="university-description">
                    <h3>📖 学校简介</h3>
                    <p>${uni.description}</p>
                </div>
                
                <div class="university-highlights">
                    <h3>⭐ 学校亮点</h3>
                    <div class="highlights-grid">
                        ${uni.highlights.map(highlight => 
                            `<div class="highlight-item">✨ ${highlight}</div>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="university-actions">
                    <button class="btn btn-primary" onclick="consultUniversity('${university}')">
                        🤖 AI咨询此大学
                    </button>
                    <button class="btn btn-secondary" onclick="addToWishlist('${university}')">
                        ⭐ 加入心愿单
                    </button>
                    <button class="btn btn-secondary" onclick="compareUniversities('${university}')">
                        📊 对比大学
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 显示动画
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // 添加点击外部关闭功能
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeUniversityModal();
        }
    });
    
    console.log('显示大学信息弹窗:', uni.name);
}

// 关闭大学信息弹窗
function closeUniversityModal() {
    const modal = document.querySelector('.university-modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// 大学相关操作函数
function consultUniversity(university) {
    closeUniversityModal();
    
    const universityNames = {
        auckland: '奥克兰大学',
        harvard: '哈佛大学',
        cambridge: '剑桥大学'
    };
    
    const universityName = universityNames[university] || university;
    
    // 切换到AI助手并提问
    showFeature('ai');
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = `我对${universityName}很感兴趣，请详细介绍一下这所大学的申请要求、专业设置、校园生活和就业前景。`;
        handleInputChange();
        
        setTimeout(() => {
            sendMessage();
        }, 500);
    }
    
    showNotificationMessage(`正在为您查询${universityName}的详细信息...`, 'info');
}

function addToWishlist(university) {
    closeUniversityModal();
    
    const universityNames = {
        auckland: '奥克兰大学',
        harvard: '哈佛大学',
        cambridge: '剑桥大学'
    };
    
    const universityName = universityNames[university] || university;
    
    // 保存到本地存储
    let wishlist = JSON.parse(localStorage.getItem('universityWishlist') || '[]');
    if (!wishlist.includes(university)) {
        wishlist.push(university);
        localStorage.setItem('universityWishlist', JSON.stringify(wishlist));
        showNotificationMessage(`${universityName}已加入心愿单！`, 'success');
    } else {
        showNotificationMessage(`${universityName}已在心愿单中`, 'info');
    }
    
    console.log('心愿单已更新:', wishlist);
}

function compareUniversities(university) {
    closeUniversityModal();
    showNotificationMessage('大学对比功能开发中...', 'info');
}

// 通知侧边栏
function closeNotificationSidebar() {
    const sidebar = document.getElementById('notificationSidebar');
    if (sidebar) {
        sidebar.style.display = 'none';
    }
}

// AI聊天功能
let aiService = null;
let markdownRenderer = null;

function initializeEnhancedChat() {
    // 等待AI服务类加载完成
    setTimeout(() => {
        try {
            if (window.AIService) {
                aiService = new window.AIService();
                console.log('🤖 AI Service initialized with API:', aiService.apiUrl);
                
                // 立即检查API状态
                setTimeout(() => {
                    if (aiService) {
                        aiService.checkAPIStatus().then(available => {
                            if (available) {
                                console.log('✅ 2brain API连接成功');
                                showNotificationMessage('AI服务已就绪，支持流式对话', 'success');
                            } else {
                                console.warn('⚠️ 2brain API连接失败，将使用模拟模式');
                                showNotificationMessage('AI API连接失败，使用模拟回复模式', 'warning');
                            }
                        });
                    }
                }, 2000);
                
            } else {
                console.warn('⚠️ AI Service class not available');
                showNotificationMessage('AI服务类未加载，使用模拟模式', 'warning');
            }
            
            if (window.MarkdownRenderer) {
                markdownRenderer = new window.MarkdownRenderer();
                console.log('📝 Markdown Renderer initialized');
            }
        } catch (error) {
            console.error('❌ AI service initialization failed:', error);
            showNotificationMessage('AI服务初始化失败，使用模拟模式', 'error');
        }
    }, 1000);
    
    updateChatStats();
    handleInputChange();
    loadChatHistory();
    console.log('🤖 Enhanced chat initialized');
}

function updateChatMode() {
    const detailedMode = document.getElementById('detailedMode');
    const contextMode = document.getElementById('contextMode');
    const chatLanguage = document.getElementById('chatLanguage');
    
    if (detailedMode) chatMode.detailed = detailedMode.checked;
    if (contextMode) chatMode.context = contextMode.checked;
    if (chatLanguage) chatMode.language = chatLanguage.value;
    
    const modeText = chatMode.detailed ? '详细咨询' : '简洁回答';
    const modeElement = document.getElementById('chatMode');
    if (modeElement) {
        modeElement.textContent = `模式: ${modeText}`;
    }
}

function handleInputChange() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const tokenCount = document.getElementById('tokenCount');
    
    if (!input) return;
    
    const text = input.value.trim();
    const charCount = text.length;
    
    if (sendBtn) {
        sendBtn.disabled = !text || isTyping;
    }
    
    if (tokenCount) {
        tokenCount.textContent = `字符: ${charCount}`;
    }
    
    // 自动调整高度
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 150) + 'px';
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const input = document.getElementById('chatInput');
        if (!isTyping && input && input.value.trim()) {
            sendMessage();
        }
    }
}

function updateChatStats() {
    const messageCountElement = document.getElementById('messageCount');
    if (messageCountElement) {
        messageCountElement.textContent = `消息: ${messageCount}`;
    }
}

function askQuickQuestion(question) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = question;
        handleInputChange();
        
        setTimeout(() => {
            sendMessage();
        }, 500);
    }
}

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message || isTyping) return;
    
    // 设置发送状态
    isTyping = true;
    const sendBtn = document.getElementById('sendBtn');
    const sendText = sendBtn.querySelector('.send-text');
    const sendIcon = sendBtn.querySelector('.send-icon');
    
    sendBtn.disabled = true;
    sendText.textContent = '发送中';
    sendIcon.textContent = '⏳';
    
    // 添加用户消息到聊天界面
    addMessageToChat('user', message);
    chatInput.value = '';
    handleInputChange();
    messageCount++;
    updateChatStats();
    
    // 显示AI思考状态
    showTypingIndicator();
    
    try {
        if (aiService) {
            console.log('🔍 AI服务状态检查:', {
                exists: !!aiService,
                available: aiService.isAvailable,
                apiUrl: aiService.apiUrl
            });
            
            if (aiService.isAvailable) {
                console.log('✅ 使用2brain API发送消息');
                await sendRealAIMessage(message);
            } else {
                console.log('⚠️ 2brain API不可用，尝试重新连接...');
                const available = await aiService.checkAPIStatus();
                if (available) {
                    console.log('✅ 重新连接成功，使用2brain API');
                    await sendRealAIMessage(message);
                } else {
                    console.log('❌ 重新连接失败，使用模拟模式');
                    showNotificationMessage('2brain API连接失败，使用模拟回复', 'warning');
                    await sendMockAIMessage(message);
                }
            }
        } else {
            console.log('❌ AI服务未初始化，使用模拟模式');
            await sendMockAIMessage(message);
        }
    } catch (error) {
        console.error('❌ Send message failed:', error);
        hideTypingIndicator();
        
        let errorMsg = '2brain AI服务异常';
        if (error.message.includes('网络')) {
            errorMsg = '网络连接失败，请检查网络后重试';
        } else if (error.message.includes('2brain API')) {
            errorMsg = '2brain API服务异常，请稍后重试';
        } else if (error.message.includes('API')) {
            errorMsg = 'API服务异常，请稍后重试';
        }
        
        addMessageToChat('assistant', `## ❌ ${errorMsg}

### 🔧 您可以尝试：

- **🔄 重新检查API状态**：点击"检查状态"按钮
- **🌐 检查网络连接**：确认网络正常
- **⏰ 稍后重试**：等待服务恢复
- **📱 使用模拟模式**：体验基本功能

> 💡 **提示**：我们正在努力恢复2brain API连接...`);
    } finally {
        // 恢复发送按钮状态
        isTyping = false;
        sendBtn.disabled = false;
        sendText.textContent = '发送';
        sendIcon.textContent = '📤';
        hideTypingIndicator();
    }
}

// 发送真实AI消息
async function sendRealAIMessage(message) {
    console.log('🚀 Sending real AI message to 2brain API:', message);
    console.log('🔗 API URL:', aiService.apiUrl);
    console.log('🔑 API Key:', aiService.apiKey.substring(0, 10) + '...');
    
    if (!aiService) {
        throw new Error('AI服务未初始化');
    }
    
    if (!aiService.isAvailable) {
        console.log('⚠️ API标记为不可用，重新检查状态...');
        const available = await aiService.checkAPIStatus();
        if (!available) {
            throw new Error('AI服务不可用，API连接失败');
        }
    }
    
    // 创建流式消息元素
    const messageElement = createStreamingMessage('assistant');
    const streamHandler = new window.StreamMessageHandler(messageElement);
    
    try {
        // 定义流式回调
        const onChunk = (chunk, fullContent) => {
            console.log('📡 Received chunk:', chunk.length, 'chars');
            streamHandler.addChunk(chunk);
        };
        
        console.log('📤 Calling aiService.sendMessage...');
        
        // 发送消息并处理流式响应
        const response = await aiService.sendMessage(message, '', onChunk);
        
        // 完成流式输出
        streamHandler.finish();
        
        console.log('✅ Real AI message completed, response length:', response.length);
        
    } catch (error) {
        console.error('❌ Real AI message failed:', error);
        
        // 移除失败的消息元素
        if (messageElement && messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
        
        // 显示详细错误信息
        console.error('错误详情:', {
            message: error.message,
            apiUrl: aiService.apiUrl,
            isAvailable: aiService.isAvailable
        });
        
        throw error;
    }
}

// 发送模拟AI消息
async function sendMockAIMessage(message) {
    console.log('🤖 Sending mock AI message');
    
    const responses = [
        `## 感谢您的咨询！

根据您的问题"${message}"，我为您提供以下**专业建议**：

### 🎯 主要建议

1. **深入了解专业**：建议您详细研究感兴趣的专业
2. **评估个人条件**：客观分析自己的学术水平和兴趣
3. **制定申请策略**：合理安排申请时间线

> 💡 **重要提示**：每个人的情况都不同，建议您根据自身条件制定个性化方案。

### 📚 后续步骤

- 收集更多专业和院校信息
- 咨询学长学姐的经验
- 参加相关的讲座和活动

**如果您需要更具体的建议，请提供更多个人信息！** 🚀`,

        `## 很好的问题！

针对"${message}"这个问题，我来为您详细分析：

### 📊 当前形势分析

现在的**教育环境**和**就业市场**都在快速变化，选择合适的发展路径非常重要。

#### 关键因素考虑：

- **个人兴趣**：这是最重要的驱动力
- **市场需求**：了解行业发展趋势  
- **个人能力**：客观评估自己的优势

### 🎯 具体建议

\`\`\`
建议框架：
1. 自我评估 → 2. 信息收集 → 3. 方案制定 → 4. 执行调整
\`\`\`

> ⚠️ **注意**：规划需要根据实际情况灵活调整

**希望这些建议对您有帮助！如有其他问题，随时咨询。** ✨`
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // 创建流式消息元素
    const messageElement = createStreamingMessage('assistant');
    const streamHandler = new window.StreamMessageHandler(messageElement);
    
    // 模拟流式输出
    const words = response.split('');
    for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20)); // 20ms延迟
        streamHandler.addChunk(words[i]);
    }
    
    // 完成流式输出
    streamHandler.finish();
    
    console.log('✅ Mock AI message completed');
}

// 创建流式消息元素
function createStreamingMessage(role) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return null;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const avatar = role === 'user' ? '👤' : '🤖';
    const currentTime = new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-text markdown-content">
                <span class="typing-indicator">🤔 思考中...</span>
            </div>
            <div class="message-time">${currentTime}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// 显示/隐藏输入指示器
function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.style.display = 'flex';
    }
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const avatar = role === 'user' ? '👤' : '🤖';
    const currentTime = new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // 处理内容格式
    let formattedContent = content;
    if (role === 'assistant' && markdownRenderer) {
        // AI消息使用Markdown渲染
        if (markdownRenderer.containsMarkdown(content)) {
            formattedContent = markdownRenderer.render(content);
        } else {
            formattedContent = content.replace(/\n/g, '<br>');
        }
    } else {
        // 用户消息保持纯文本
        formattedContent = content.replace(/\n/g, '<br>');
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-text ${role === 'assistant' ? 'markdown-content' : ''}">${formattedContent}</div>
            <div class="message-time">${currentTime}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 启用代码高亮
    if (role === 'assistant' && typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(messageDiv);
    }
    
    // 保存到历史记录
    chatHistory.push({
        role: role,
        content: content,
        timestamp: new Date().toISOString()
    });
    
    saveChatHistory();
    
    return messageDiv;
}

function clearChat() {
    if (confirm('确定要清空所有对话记录吗？')) {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="message assistant-message">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <div class="message-text">
                            🎓 欢迎使用智能升学助手！<br><br>
                            您好！我是您的AI升学顾问，很高兴为您服务！👋<br><br>
                            请告诉我您的具体需求，或选择下方的快速咨询选项开始对话。
                        </div>
                    </div>
                </div>
            `;
        }
        
        chatHistory = [];
        messageCount = 0;
        updateChatStats();
    }
}

function exportChat() {
    if (chatHistory.length === 0) {
        showNotificationMessage('没有对话记录可以导出！', 'warning');
        return;
    }
    
    const chatText = chatHistory.map(msg => 
        `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role === 'user' ? '我' : 'AI顾问'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `升学咨询记录_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotificationMessage('对话记录已导出', 'success');
}

function loadChatHistory() {
    try {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            chatHistory = JSON.parse(saved);
            messageCount = chatHistory.length;
            updateChatStats();
        }
    } catch (error) {
        console.warn('Failed to load chat history:', error);
    }
}

function saveChatHistory() {
    try {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } catch (error) {
        console.warn('Failed to save chat history:', error);
    }
}

async function checkAPIStatus() {
    try {
        updateAPIStatus('checking', '检查中...');
        
        if (aiService) {
            const isAvailable = await aiService.checkAPIStatus();
            if (isAvailable) {
                showNotificationMessage('AI服务连接正常！', 'success');
            } else {
                showNotificationMessage('AI服务连接失败，请检查网络', 'error');
            }
        } else {
            showNotificationMessage('AI服务未初始化', 'warning');
        }
    } catch (error) {
        console.error('API status check failed:', error);
        showNotificationMessage('API状态检查失败', 'error');
    }
}

function updateAPIStatus(status, text) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const apiStatus = document.getElementById('apiStatus');
    
    if (statusDot && statusText) {
        statusDot.classList.remove('online', 'offline', 'checking');
        statusDot.classList.add(status);
        statusText.textContent = text;
    }
    
    if (apiStatus) {
        apiStatus.textContent = `API: ${text}`;
    }
}

function insertTemplate() {
    const chatInput = document.getElementById('chatInput');
    const templates = [
        '我想了解[专业名称]的详细信息，包括课程设置、就业前景和申请要求。',
        '请帮我分析[大学名称]的录取要求和申请策略。',
        '我的GPA是[数值]，SAT是[数值]，请推荐适合的大学。',
        '如何写一份出色的个人陈述？请提供具体的写作框架和技巧。'
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    if (chatInput) {
        chatInput.value = template;
        handleInputChange();
        chatInput.focus();
    }
    
    showNotificationMessage('模板已插入，请修改后发送', 'info');
}

function uploadFile() {
    showNotificationMessage('文件上传功能开发中...', 'info');
}

function changeLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        const selectedLanguage = languageSelect.value;
        showNotificationMessage(`语言已切换为${selectedLanguage === 'zh-CN' ? '中文' : '英文'}`, 'success');
    }
}

// 页面效果函数
function addScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .stat-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

function simulateDataLoading() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat) => {
        const finalValue = stat.textContent;
        const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
        
        if (!isNaN(numericValue)) {
            let currentValue = 0;
            const increment = numericValue / 50;
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= numericValue) {
                    currentValue = numericValue;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(currentValue) + finalValue.replace(/[\d]/g, '');
            }, 50);
        }
    });
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Smart College Advisor main app initializing...');
    
    // 等待Firebase初始化完成（在firebase-simple.js中处理）
    setTimeout(() => {
        // 加载记住的邮箱
        loadRememberedEmail();
        
        // 初始化搜索功能
        initSearch();
        
        // 显示登录界面
        showLogin();
        
        console.log('✅ Smart College Advisor main app initialized');
        
        // 显示通知横幅
        setTimeout(() => {
            showNotificationMessage('欢迎使用Smart College Advisor！', 'success');
        }, 1000);
    }, 500);
});

// 点击外部关闭下拉菜单
document.addEventListener('click', function(e) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && dropdown && !userMenu.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// ESC键关闭弹窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // 关闭大学信息弹窗
        const universityModal = document.querySelector('.university-modal-overlay');
        if (universityModal) {
            closeUniversityModal();
        }
        
        // 关闭用户下拉菜单
        const dropdown = document.getElementById('userDropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// 将关键函数暴露到全局作用域
window.updateUserAvatar = updateUserAvatar;
window.showLogin = showLogin;
window.showCareer = showCareer;
window.showMain = showMain;
window.showNotificationMessage = showNotificationMessage;
window.firebaseSignInWithGoogle = firebaseSignInWithGoogle;
window.firebaseSignInAnonymously = firebaseSignInAnonymously;
window.saveUserToFirestore = saveUserToFirestore;

// 题库功能函数
function showQuizMode() {
    showNotificationMessage('测验模式功能开发中...', 'info');
}

function showProgress() {
    showNotificationMessage('进度查看功能开发中...', 'info');
}

function startRandomQuiz() {
    showNotificationMessage('随机测验功能开发中...', 'info');
}

function filterQuestions() {
    const subject = document.getElementById('subjectFilter')?.value || '';
    const difficulty = document.getElementById('difficultyFilter')?.value || '';
    const type = document.getElementById('typeFilter')?.value || '';
    
    console.log('筛选题目:', { subject, difficulty, type });
    showNotificationMessage(`已筛选: ${subject || '全部学科'} - ${difficulty || '全部难度'} - ${type || '全部类型'}`, 'info');
}

function searchQuestions() {
    const searchTerm = document.getElementById('questionSearch')?.value || '';
    console.log('搜索题目:', searchTerm);
    
    if (searchTerm.trim()) {
        showNotificationMessage(`搜索功能开发中，搜索词：${searchTerm}`, 'info');
    } else {
        showNotificationMessage('请输入搜索关键词', 'warning');
    }
}

function startSubjectQuiz(subject) {
    const subjectNames = {
        math: '数学',
        english: '英语',
        science: '科学',
        history: '历史'
    };
    
    const subjectName = subjectNames[subject] || subject;
    console.log('开始学科测验:', subjectName);
    showNotificationMessage(`${subjectName}测验功能开发中...`, 'info');
}

function practiceQuestion(questionId) {
    console.log('开始练习题目:', questionId);
    showNotificationMessage(`题目练习功能开发中...`, 'info');
}

function viewSolution(questionId) {
    console.log('查看解答:', questionId);
    showNotificationMessage(`解答查看功能开发中...`, 'info');
}

function bookmarkQuestion(questionId) {
    console.log('收藏题目:', questionId);
    showNotificationMessage(`题目已收藏！`, 'success');
}

function findSimilar(questionId) {
    console.log('查找相似题目:', questionId);
    showNotificationMessage(`相似题目功能开发中...`, 'info');
}

function viewExamples(questionId) {
    console.log('查看范文:', questionId);
    showNotificationMessage(`范文查看功能开发中...`, 'info');
}

function getWritingTips(questionId) {
    console.log('获取写作指导:', questionId);
    showNotificationMessage(`写作指导功能开发中...`, 'info');
}

function viewSteps(questionId) {
    console.log('查看解题步骤:', questionId);
    showNotificationMessage(`解题步骤功能开发中...`, 'info');
}

function getFormulas(questionId) {
    console.log('查看公式提示:', questionId);
    showNotificationMessage(`公式提示功能开发中...`, 'info');
}

function getRecommendations() {
    showNotificationMessage('智能推荐功能开发中...', 'info');
}

function viewWrongQuestions() {
    showNotificationMessage('错题本功能开发中...', 'info');
}

function startTimedPractice() {
    showNotificationMessage('计时练习功能开发中...', 'info');
}

function viewAchievements() {
    showNotificationMessage('成就系统功能开发中...', 'info');
}

// 将题库函数暴露到全局作用域
window.showQuizMode = showQuizMode;
window.showProgress = showProgress;
window.startRandomQuiz = startRandomQuiz;
window.filterQuestions = filterQuestions;
window.searchQuestions = searchQuestions;
window.startSubjectQuiz = startSubjectQuiz;
window.practiceQuestion = practiceQuestion;
window.viewSolution = viewSolution;
window.bookmarkQuestion = bookmarkQuestion;
window.findSimilar = findSimilar;
window.viewExamples = viewExamples;
window.getWritingTips = getWritingTips;
window.viewSteps = viewSteps;
window.getFormulas = getFormulas;
window.getRecommendations = getRecommendations;
window.viewWrongQuestions = viewWrongQuestions;
window.startTimedPractice = startTimedPractice;
window.viewAchievements = viewAchievements;

// 申请策略功能函数
function generatePersonalizedStrategy() {
    showNotificationMessage('个性化策略生成功能开发中...', 'info');
}

function exportStrategy() {
    showNotificationMessage('策略导出功能开发中...', 'info');
}

function showStrategyTab(tabName) {
    // 隐藏所有标签内容
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // 移除所有标签的active状态
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签内容
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 激活对应的标签按钮
    const targetBtn = event.target;
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    console.log('切换到策略标签:', tabName);
    
    const tabNames = {
        timeline: '时间线',
        requirements: '申请要求',
        essays: '文书写作',
        schools: '目标院校'
    };
    
    showNotificationMessage(`已切换到${tabNames[tabName] || tabName}`, 'info');
}

function editEssay(essayType) {
    console.log('编辑文书:', essayType);
    showNotificationMessage('文书编辑功能开发中...', 'info');
}

function getEssayFeedback(essayType) {
    console.log('获取文书反馈:', essayType);
    showNotificationMessage('文书反馈功能开发中...', 'info');
}

function startEssay(essayType) {
    console.log('开始写作文书:', essayType);
    showNotificationMessage('文书写作功能开发中...', 'info');
}

function getEssayTips(essayType) {
    console.log('获取文书建议:', essayType);
    showNotificationMessage('文书建议功能开发中...', 'info');
}

// 将申请策略函数暴露到全局作用域
window.generatePersonalizedStrategy = generatePersonalizedStrategy;
window.exportStrategy = exportStrategy;
window.showStrategyTab = showStrategyTab;
window.editEssay = editEssay;
window.getEssayFeedback = getEssayFeedback;
window.startEssay = startEssay;
window.getEssayTips = getEssayTips;

// 大学信息弹窗相关函数
window.showUniversityInfo = showUniversityInfo;
window.closeUniversityModal = closeUniversityModal;
window.consultUniversity = consultUniversity;
window.addToWishlist = addToWishlist;
window.compareUniversities = compareUniversities;

// AI助手相关函数
window.insertTemplate = insertTemplate;
window.uploadFile = uploadFile;
window.checkAPIStatus = checkAPIStatus;
window.updateAPIStatus = updateAPIStatus;
window.showTypingIndicator = showTypingIndicator;
window.hideTypingIndicator = hideTypingIndicator;
window.createStreamingMessage = createStreamingMessage;
window.sendRealAIMessage = sendRealAIMessage;
window.sendMockAIMessage = sendMockAIMessage;

console.log('🎉 Enhanced App.js loaded successfully with global functions exposed');
