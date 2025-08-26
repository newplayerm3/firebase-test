/**
 * Firebase 登录集成脚本
 * 将Firebase认证服务完全集成到登录界面
 */

(function() {
    'use strict';

    console.log('🔥 Firebase登录集成脚本启动...');

    // Firebase登录状态管理
    const firebaseLoginManager = {
        // 初始化Firebase登录集成
        init: function() {
            console.log('🚀 初始化Firebase登录集成...');
            
            // 监听Firebase初始化事件
            window.addEventListener('firebaseInitialized', () => {
                console.log('✅ Firebase已初始化，启用完整登录功能');
                this.enableFirebaseFeatures();
            });

            // 监听Firebase初始化失败事件
            window.addEventListener('firebaseInitFailed', () => {
                console.log('❌ Firebase初始化失败，但保持在线模式等待重连');
                // 不自动启用本地回退，保持Firebase在线模式
                console.log('🔥 保持Firebase在线状态，继续尝试连接...');
            });

            // 监听认证状态变化
            this.setupAuthStateListener();
            
            // 增强登录表单
            this.enhanceLoginForms();
        },

        // 设置认证状态监听器
        setupAuthStateListener: function() {
            // 等待Firebase服务可用
            const checkFirebaseAuth = () => {
                if (window.firebaseService && window.firebaseService.auth) {
                    window.firebaseService.auth.onAuthStateChanged((user) => {
                        console.log('🔄 认证状态变化:', user ? `用户已登录: ${user.email || user.uid}` : '用户未登录');
                        
                        if (user) {
                            this.handleSuccessfulLogin(user);
                        } else {
                            this.handleLogout();
                        }
                    });
                } else {
                    // 如果Firebase服务未就绪，1秒后重试
                    setTimeout(checkFirebaseAuth, 1000);
                }
            };
            
            checkFirebaseAuth();
        },

        // 处理成功登录
        handleSuccessfulLogin: function(user) {
            console.log('✅ 用户登录成功:', user);
            
            // 更新用户界面
            if (window.updateUserAvatar) {
                window.updateUserAvatar({
                    name: user.displayName || user.email || '用户',
                    email: user.email,
                    avatar: user.photoURL,
                    isAnonymous: user.isAnonymous
                });
            }

            // 显示主界面
            if (window.showMainInterface) {
                window.showMainInterface();
            }

            // 显示成功消息
            const loginType = user.isAnonymous ? '访客模式' : 
                             user.providerData.length > 0 && user.providerData[0].providerId === 'google.com' ? 'Google登录' : 
                             '邮箱登录';
            
            if (window.showNotificationMessage) {
                window.showNotificationMessage(`${loginType}成功！欢迎回来！`, 'success');
            }
        },

        // 处理登出
        handleLogout: function() {
            console.log('🚪 用户已登出');
            
            // 更新用户界面
            if (window.updateUserAvatar) {
                window.updateUserAvatar(null);
            }

            // 显示登录界面
            if (window.showLoginInterface) {
                window.showLoginInterface();
            }
        },

        // 启用Firebase功能
        enableFirebaseFeatures: function() {
            console.log('🌐 启用Firebase完整功能...');
            
            // 启用Google登录按钮
            const googleBtns = document.querySelectorAll('[onclick*="firebaseSignInWithGoogle"]');
            googleBtns.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.title = '';
                
                // 恢复按钮文字
                if (btn.innerHTML.includes('不可用')) {
                    btn.innerHTML = btn.innerHTML.replace(' (不可用)', '');
                }
            });

            // 启用匿名登录按钮
            const guestBtns = document.querySelectorAll('[onclick*="firebaseSignInAnonymously"]');
            guestBtns.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            });

            console.log('✅ Firebase功能已启用');
        },

        // 等待Firebase服务初始化
        waitForFirebaseService: function(maxWaitTime = 10000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                
                const checkFirebase = () => {
                    if (window.firebaseService && window.firebaseService.isInitialized) {
                        resolve(true);
                        return;
                    }
                    
                    if (Date.now() - startTime > maxWaitTime) {
                        reject(new Error('Firebase服务连接超时'));
                        return;
                    }
                    
                    setTimeout(checkFirebase, 500); // 每500ms检查一次
                };
                
                checkFirebase();
            });
        },

        // 启用本地回退模式
        enableLocalFallback: function() {
            console.log('🔄 启用本地回退模式...');
            
            // 禁用Google登录按钮
            const googleBtns = document.querySelectorAll('[onclick*="firebaseSignInWithGoogle"]');
            googleBtns.forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
                btn.title = 'Firebase服务不可用，Google登录暂时无法使用';
                
                if (!btn.innerHTML.includes('不可用')) {
                    btn.innerHTML += ' (不可用)';
                }
            });

            // 禁用匿名登录按钮
            const guestBtns = document.querySelectorAll('[onclick*="firebaseSignInAnonymously"]');
            guestBtns.forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
                btn.title = 'Firebase服务不可用，访客模式暂时无法使用';
            });

            console.log('⚠️ 本地回退模式已启用');
        },

        // 增强登录表单
        enhanceLoginForms: function() {
            console.log('🎨 增强登录表单...');
            
            // 增强邮箱登录表单
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.handleEmailLogin();
                });
            }

            // 增强注册表单
            const registerForm = document.getElementById('registerForm');
            if (registerForm) {
                registerForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.handleEmailRegister();
                });
            }

            // 添加键盘快捷键支持
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    const activeForm = document.querySelector('.auth-form[style*="display: block"]');
                    if (activeForm) {
                        const submitBtn = activeForm.querySelector('button[type="submit"]');
                        if (submitBtn) submitBtn.click();
                    }
                }
            });
        },

        // 处理邮箱登录
        handleEmailLogin: async function() {
            const email = document.getElementById('loginEmail')?.value.trim();
            const password = document.getElementById('loginPassword')?.value;

            if (!email || !password) {
                if (window.showNotificationMessage) {
                    window.showNotificationMessage('请填写邮箱和密码', 'error');
                }
                return;
            }

            try {
                if (window.showNotificationMessage) {
                    window.showNotificationMessage('正在登录...', 'info');
                }

                // 优先尝试Firebase登录
                if (window.firebaseService && window.firebaseService.isInitialized) {
                    await window.firebaseService.signInWithEmail(email, password);
                } else {
                    // Firebase未就绪时，显示等待消息而不是立即回退
                    if (window.showNotificationMessage) {
                        window.showNotificationMessage('正在连接Firebase服务，请稍候...', 'info');
                    }
                    
                    // 等待Firebase服务
                    await this.waitForFirebaseService();
                    if (window.firebaseService && window.firebaseService.isInitialized) {
                        await window.firebaseService.signInWithEmail(email, password);
                    } else {
                        throw new Error('Firebase服务暂时不可用，请稍后重试');
                    }
                }

            } catch (error) {
                console.error('登录失败:', error);
                
                let errorMessage = '登录失败，请重试';
                if (error.code === 'auth/user-not-found') {
                    errorMessage = '用户不存在，请先注册';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = '密码错误，请重试';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = '邮箱格式不正确';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = '登录尝试次数过多，请稍后再试';
                }

                if (window.showNotificationMessage) {
                    window.showNotificationMessage(errorMessage, 'error');
                }
            }
        },

        // 处理邮箱注册
        handleEmailRegister: async function() {
            const name = document.getElementById('registerName')?.value.trim();
            const email = document.getElementById('registerEmail')?.value.trim();
            const password = document.getElementById('registerPassword')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            if (!name || !email || !password || !confirmPassword) {
                if (window.showNotificationMessage) {
                    window.showNotificationMessage('请填写所有必填字段', 'error');
                }
                return;
            }

            if (password !== confirmPassword) {
                if (window.showNotificationMessage) {
                    window.showNotificationMessage('两次输入的密码不一致', 'error');
                }
                return;
            }

            if (password.length < 6) {
                if (window.showNotificationMessage) {
                    window.showNotificationMessage('密码长度至少6位', 'error');
                }
                return;
            }

            try {
                if (window.showNotificationMessage) {
                    window.showNotificationMessage('正在注册账户...', 'info');
                }

                // 优先尝试Firebase注册
                if (window.firebaseService && window.firebaseService.isInitialized) {
                    await window.firebaseService.signUpWithEmail(email, password, name);
                    if (window.showNotificationMessage) {
                        window.showNotificationMessage('注册成功！欢迎加入！', 'success');
                    }
                } else {
                    // Firebase未就绪时，等待服务
                    if (window.showNotificationMessage) {
                        window.showNotificationMessage('正在连接Firebase服务，请稍候...', 'info');
                    }
                    
                    await this.waitForFirebaseService();
                    if (window.firebaseService && window.firebaseService.isInitialized) {
                        await window.firebaseService.signUpWithEmail(email, password, name);
                        if (window.showNotificationMessage) {
                            window.showNotificationMessage('注册成功！欢迎加入！', 'success');
                        }
                    } else {
                        throw new Error('Firebase服务暂时不可用，请稍后重试');
                    }
                }

            } catch (error) {
                console.error('注册失败:', error);
                
                let errorMessage = '注册失败，请重试';
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = '该邮箱已被注册，请直接登录';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = '邮箱格式不正确';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = '密码强度不够，请使用更复杂的密码';
                }

                if (window.showNotificationMessage) {
                    window.showNotificationMessage(errorMessage, 'error');
                }
            }
        },

        // 增强Google登录
        enhanceGoogleLogin: function() {
            window.firebaseSignInWithGoogle = async function() {
                try {
                    if (!window.firebaseService || !window.firebaseService.isInitialized) {
                        throw new Error('Firebase服务未初始化');
                    }
                    
                    if (window.showNotificationMessage) {
                        window.showNotificationMessage('正在连接Google账户...', 'info');
                    }
                    
                    await window.firebaseService.signInWithGoogle();
                    
                } catch (error) {
                    console.error('Google登录失败:', error);
                    
                    let errorMessage = 'Google登录失败，请重试';
                    if (error.code === 'auth/popup-closed-by-user') {
                        errorMessage = '登录窗口被关闭，请重试';
                    } else if (error.code === 'auth/popup-blocked') {
                        errorMessage = '弹窗被阻止，请允许弹窗后重试';
                    }
                    
                    if (window.showNotificationMessage) {
                        window.showNotificationMessage(errorMessage, 'error');
                    }
                }
            };
        },

        // 增强匿名登录
        enhanceAnonymousLogin: function() {
            window.firebaseSignInAnonymously = async function() {
                try {
                    if (!window.firebaseService || !window.firebaseService.isInitialized) {
                        throw new Error('Firebase服务未初始化');
                    }
                    
                    if (window.showNotificationMessage) {
                        window.showNotificationMessage('正在以访客身份登录...', 'info');
                    }
                    
                    await window.firebaseService.signInAnonymously();
                    
                } catch (error) {
                    console.error('访客登录失败:', error);
                    
                    let errorMessage = '访客登录失败，请重试';
                    if (error.code === 'auth/operation-not-allowed') {
                        errorMessage = '访客登录功能未启用，请联系管理员';
                    }
                    
                    if (window.showNotificationMessage) {
                        window.showNotificationMessage(errorMessage, 'error');
                    }
                }
            };
        }
    };

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            firebaseLoginManager.init();
            firebaseLoginManager.enhanceGoogleLogin();
            firebaseLoginManager.enhanceAnonymousLogin();
        });
    } else {
        firebaseLoginManager.init();
        firebaseLoginManager.enhanceGoogleLogin();
        firebaseLoginManager.enhanceAnonymousLogin();
    }

    // 将管理器暴露到全局作用域
    window.firebaseLoginManager = firebaseLoginManager;
    
    console.log('✅ Firebase登录集成脚本已就绪');

})();
