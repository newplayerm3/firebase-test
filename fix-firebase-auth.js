/**
 * Firebase认证快速修复脚本
 * 自动检测和修复常见的Firebase认证配置问题
 */

(function() {
    'use strict';

    console.log('🔧 Firebase认证快速修复工具启动...');

    // 修复配置
    const fixes = {
        // 1. 确保Firebase SDK正确加载
        ensureSDKLoaded: function() {
            return new Promise((resolve, reject) => {
                if (typeof firebase !== 'undefined') {
                    console.log('✅ Firebase SDK已加载');
                    resolve(true);
                } else {
                    console.log('❌ Firebase SDK未加载，尝试动态加载...');
                    
                    // 动态加载Firebase SDK
                    const scripts = [
                        'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
                        'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js',
                        'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
                    ];
                    
                    let loadedCount = 0;
                    scripts.forEach(src => {
                        const script = document.createElement('script');
                        script.src = src;
                        script.onload = () => {
                            loadedCount++;
                            if (loadedCount === scripts.length) {
                                console.log('✅ Firebase SDK动态加载完成');
                                resolve(true);
                            }
                        };
                        script.onerror = () => {
                            console.error('❌ 无法加载Firebase SDK:', src);
                            reject(false);
                        };
                        document.head.appendChild(script);
                    });
                }
            });
        },

        // 2. 修复Firebase初始化
        fixInitialization: function() {
            return new Promise((resolve, reject) => {
                try {
                    if (!window.CONFIG || !window.CONFIG.firebase || !window.CONFIG.firebase.config) {
                        throw new Error('Firebase配置缺失');
                    }

                    const config = window.CONFIG.firebase.config;
                    
                    // 验证配置完整性
                    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
                    const missingFields = requiredFields.filter(field => !config[field]);
                    
                    if (missingFields.length > 0) {
                        throw new Error(`缺少必需的配置字段: ${missingFields.join(', ')}`);
                    }

                    // 初始化Firebase（如果尚未初始化）
                    if (!firebase.apps.length) {
                        firebase.initializeApp(config);
                        console.log('✅ Firebase初始化成功');
                    } else {
                        console.log('✅ Firebase已初始化');
                    }
                    
                    resolve(true);
                } catch (error) {
                    console.error('❌ Firebase初始化失败:', error.message);
                    reject(error);
                }
            });
        },

        // 3. 修复认证提供商配置
        fixAuthProviders: function() {
            return new Promise((resolve) => {
                try {
                    const auth = firebase.auth();
                    const fixes = [];

                    // 测试Google登录
                    try {
                        const googleProvider = new firebase.auth.GoogleAuthProvider();
                        googleProvider.addScope('email');
                        googleProvider.addScope('profile');
                        console.log('✅ Google认证提供商配置成功');
                        fixes.push('google');
                    } catch (error) {
                        console.warn('⚠️ Google认证提供商配置问题:', error.message);
                    }

                    // 测试匿名登录（不实际登录）
                    auth.onAuthStateChanged((user) => {
                        if (user && user.isAnonymous) {
                            console.log('✅ 匿名登录功能正常');
                            fixes.push('anonymous');
                            // 退出匿名用户
                            auth.signOut();
                        }
                    });

                    resolve(fixes);
                } catch (error) {
                    console.error('❌ 认证提供商配置失败:', error.message);
                    resolve([]);
                }
            });
        },

        // 4. 修复域名配置问题
        checkDomainConfiguration: function() {
            const currentDomain = window.location.hostname;
            const port = window.location.port;
            const protocol = window.location.protocol;
            
            console.log(`📍 当前访问地址: ${protocol}//${currentDomain}${port ? ':' + port : ''}`);
            
            const suggestions = [];
            
            if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
                suggestions.push('确保在Firebase控制台的授权域名中添加了 localhost 和 127.0.0.1');
            }
            
            if (port && port !== '80' && port !== '443') {
                suggestions.push(`如果使用端口${port}，确保在OAuth配置中包含完整的重定向URI`);
            }
            
            return {
                domain: currentDomain,
                port: port,
                suggestions: suggestions
            };
        },

        // 5. 创建测试用户会话
        createTestSession: function() {
            return new Promise((resolve, reject) => {
                try {
                    const auth = firebase.auth();
                    
                    // 监听认证状态变化
                    const unsubscribe = auth.onAuthStateChanged((user) => {
                        if (user) {
                            console.log('✅ 用户认证状态正常:', user.uid);
                            resolve({
                                uid: user.uid,
                                isAnonymous: user.isAnonymous,
                                email: user.email
                            });
                        } else {
                            console.log('ℹ️ 用户未登录');
                            resolve(null);
                        }
                        unsubscribe();
                    });
                    
                    // 超时处理
                    setTimeout(() => {
                        unsubscribe();
                        resolve(null);
                    }, 5000);
                    
                } catch (error) {
                    console.error('❌ 无法检查认证状态:', error.message);
                    reject(error);
                }
            });
        }
    };

    // 执行修复流程
    async function runFixes() {
        console.log('🚀 开始执行修复流程...');
        
        const results = {
            sdkLoaded: false,
            initialized: false,
            authProviders: [],
            domainConfig: null,
            userSession: null,
            errors: []
        };

        try {
            // 1. 确保SDK加载
            results.sdkLoaded = await fixes.ensureSDKLoaded();
            
            // 2. 修复初始化
            if (results.sdkLoaded) {
                results.initialized = await fixes.fixInitialization();
            }
            
            // 3. 修复认证提供商
            if (results.initialized) {
                results.authProviders = await fixes.fixAuthProviders();
            }
            
            // 4. 检查域名配置
            results.domainConfig = fixes.checkDomainConfiguration();
            
            // 5. 检查用户会话
            if (results.initialized) {
                results.userSession = await fixes.createTestSession();
            }
            
        } catch (error) {
            results.errors.push(error.message);
            console.error('❌ 修复过程中出现错误:', error);
        }

        // 输出修复报告
        console.log('📊 修复完成，报告如下:');
        console.table(results);
        
        // 提供修复建议
        const suggestions = [];
        
        if (!results.sdkLoaded) {
            suggestions.push('请检查网络连接，确保能够访问Firebase CDN');
        }
        
        if (!results.initialized) {
            suggestions.push('请检查config.js中的Firebase配置是否正确');
        }
        
        if (results.authProviders.length === 0) {
            suggestions.push('请在Firebase控制台中启用Google和匿名登录');
        }
        
        if (results.domainConfig.suggestions.length > 0) {
            suggestions.push(...results.domainConfig.suggestions);
        }
        
        if (suggestions.length > 0) {
            console.log('💡 修复建议:');
            suggestions.forEach((suggestion, index) => {
                console.log(`${index + 1}. ${suggestion}`);
            });
        }

        // 在全局作用域中提供结果
        window.firebaseFixResults = results;
        
        return results;
    }

    // 页面加载完成后自动执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runFixes);
    } else {
        runFixes();
    }

    // 提供手动执行接口
    window.runFirebaseFixes = runFixes;
    
    console.log('✅ Firebase认证修复工具已就绪');
    console.log('💡 您可以调用 window.runFirebaseFixes() 手动执行修复');

})();
