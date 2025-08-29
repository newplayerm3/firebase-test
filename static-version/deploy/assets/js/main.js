/**
 * 智能升学助手 - 静态版本主JavaScript文件
 * 移除所有Firebase和动态功能，保留基本UI交互
 */

// 全局变量
let currentFeature = null;
let searchData = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 智能升学助手静态版本加载完成');
    
    // 初始化功能
    initSearch();
    addScrollEffects();
    showNotification();
    
    // 绑定事件
    bindEvents();
});

// 绑定事件
function bindEvents() {
    // 搜索框事件
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('input', handleSearch);
        searchBox.addEventListener('keypress', handleSearchKeypress);
    }
    
    // 联系表单提交
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

// 显示功能页面
function showFeature(featureName) {
    // 隐藏所有功能页面
    hideFeature();
    
    // 显示选中的功能页面
    const featureElement = document.getElementById(featureName + 'Feature');
    if (featureElement) {
        featureElement.classList.add('active');
        currentFeature = featureName;
        
        // 滚动到功能页面
        featureElement.scrollIntoView({ behavior: 'smooth' });
        
        console.log('📱 显示功能:', featureName);
    }
}

// 隐藏功能页面
function hideFeature() {
    const features = document.querySelectorAll('.feature-content');
    features.forEach(f => f.classList.remove('active'));
    currentFeature = null;
}

// 显示设置
function showSettings() {
    alert('⚙️ 设置功能正在开发中，敬请期待！');
}

}

// 处理搜索输入
function handleSearch(e) {
    const query = e.target.value.trim();
    if (query.length > 0) {
        console.log('🔍 搜索:', query);
        // 这里可以添加搜索逻辑
    }
}

// 处理搜索回车
function handleSearchKeypress(e) {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query.length > 0) {
            performSearch(query);
        }
    }
}

// 执行搜索
function performSearch(query) {
    console.log('🔍 执行搜索:', query);
    
    // 模拟搜索功能
    const searchResults = simulateSearch(query);
    
    if (searchResults.length > 0) {
        showSearchResults(searchResults);
    } else {
        showNoResults(query);
    }
}

// 模拟搜索
function simulateSearch(query) {
    const mockData = [
        { type: 'university', name: '清华大学', match: '计算机科学', score: 95 },
        { type: 'university', name: '北京大学', match: '计算机科学', score: 92 },
        { type: 'major', name: '计算机科学与技术', match: '计算机', score: 90 },
        { type: 'course', name: '数据结构', match: '计算机', score: 88 }
    ];
    
    return mockData.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.match.toLowerCase().includes(query.toLowerCase())
    );
}

// 显示搜索结果
function showSearchResults(results) {
    const message = `找到 ${results.length} 个相关结果：\n\n` +
        results.map(item => `• ${item.name} (${item.type})`).join('\n');
    
    alert(message);
}

// 显示无结果
function showNoResults(query) {
    alert(`未找到与"${query}"相关的结果。\n\n💡 建议：\n• 尝试其他关键词\n• 检查拼写是否正确\n• 使用更通用的词汇`);
}

// 显示联系模态框
function showContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 关闭联系模态框
function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 处理联系表单提交
function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // 模拟表单提交
    console.log('📝 联系表单提交:', { name, email, message });
    
    // 显示成功消息
    alert(`✅ 感谢您的留言！\n\n我们已收到您的消息，将在24小时内回复您。\n\n姓名: ${name}\n邮箱: ${email}\n留言: ${message}`);
    
    // 关闭模态框
    closeContactModal();
    
    // 重置表单
    e.target.reset();
}

// 显示通知横幅
function showNotification() {
    const banner = document.getElementById('notificationBanner');
    if (banner) {
        banner.classList.add('show');
    }
}

// 关闭通知横幅
function closeNotification() {
    const banner = document.getElementById('notificationBanner');
    if (banner) {
        banner.classList.remove('show');
    }
}

// 添加滚动效果
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

    // 观察需要动画的元素
    document.querySelectorAll('.feature-card, .stat-card, .university-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// 模拟数据加载
function simulateDataLoading() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat, index) => {
        const finalValue = stat.textContent;
        const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
        
        if (!isNaN(numericValue)) {
            let currentValue = 0;
            const increment = numericValue / 50;
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= numericValue) {
                    stat.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(currentValue) + (finalValue.includes('+') ? '+' : '');
                }
            }, 20);
        }
    });
}

// 显示大学信息
function showUniversityInfo(universityId) {
    const universityData = {
        tsinghua: {
            name: '清华大学',
            description: '中国顶尖学府，世界一流大学',
            location: '北京市海淀区',
            founded: '1911年',
            ranking: '世界排名第16位',
            specialties: ['计算机科学', '工程学', '理学', '经济学', '管理学']
        },
        beijing: {
            name: '北京大学',
            description: '百年名校，人文社科强校',
            location: '北京市海淀区',
            founded: '1898年',
            ranking: '世界排名第18位',
            specialties: ['中文系', '历史学', '哲学', '经济学', '法学']
        },
        harvard: {
            name: '哈佛大学',
            description: '世界顶级研究型大学',
            location: '美国马萨诸塞州剑桥市',
            founded: '1636年',
            ranking: '世界排名第1位',
            specialties: ['法学', '医学', '商学', '政治学', '经济学']
        },
        mit: {
            name: '麻省理工学院',
            description: '科技创新的摇篮',
            location: '美国马萨诸塞州剑桥市',
            founded: '1861年',
            ranking: '世界排名第2位',
            specialties: ['工程学', '计算机科学', '物理学', '化学', '生物学']
        }
    };
    
    const university = universityData[universityId];
    if (university) {
        const message = `🏫 ${university.name}\n\n` +
            `📖 简介: ${university.description}\n` +
            `📍 位置: ${university.location}\n` +
            `📅 建校: ${university.founded}\n` +
            `🏆 排名: ${university.ranking}\n\n` +
            `🎯 优势专业:\n${university.specialties.map(s => `• ${s}`).join('\n')}`;
        
        alert(message);
    }
}

// 初始化搜索功能
function initSearch() {
    console.log('🔍 搜索功能初始化完成');
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 工具函数：节流
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 导出到全局作用域
window.showFeature = showFeature;
window.hideFeature = hideFeature;
window.showSettings = showSettings;
window.showContactModal = showContactModal;
window.closeContactModal = closeContactModal;
window.closeNotification = closeNotification;
window.showUniversityInfo = showUniversityInfo;

console.log('✅ 智能升学助手静态版本JavaScript加载完成');
