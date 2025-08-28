/**
 * 简化的Firebase初始化脚本
 * 解决Firebase初始化失败的问题
 */

(function() {
    'use strict';
    
    console.log('🔥 开始简化Firebase初始化...');
    
    // 等待DOM和config加载
    function waitForDependencies() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 10秒超时
            
            const checkDependencies = () => {
                attempts++;
                
                // 检查必要的依赖
                if (typeof firebase === 'undefined') {
                    if (attempts >= maxAttempts) {
                        reject(new Error('Firebase SDK加载超时'));
                        return;
                    }
                    setTimeout(checkDependencies, 200);
                    return;
                }
                
                if (typeof window.CONFIG === 'undefined') {
                    if (attempts >= maxAttempts) {
                        reject(new Error('CONFIG配置加载超时'));
                        return;
                    }
                    setTimeout(checkDependencies, 200);
                    return;
                }
                
                resolve();
            };
            
            checkDependencies();
        });
    }
    
    // 初始化Firebase
    async function initializeFirebase() {
        try {
            console.log('🔥 等待依赖加载...');
            await waitForDependencies();
            
            console.log('🔥 依赖已加载，开始初始化Firebase...');
            
            // 检查配置
            const config = window.CONFIG?.firebase?.config;
            if (!config) {
                throw new Error('Firebase配置未找到');
            }
            
            console.log('🔥 Firebase配置:', {
                projectId: config.projectId,
                authDomain: config.authDomain,
                hasApiKey: !!config.apiKey
            });
            
            // 初始化Firebase应用
            let app;
            if (firebase.apps.length > 0) {
                console.log('🔥 使用现有Firebase应用');
                app = firebase.app();
            } else {
                console.log('🔥 创建新Firebase应用');
                app = firebase.initializeApp(config);
            }
            
            // 初始化认证服务
            const auth = firebase.auth();
            console.log('🔐 Firebase Auth初始化成功');
            
            // 测试Auth是否正常工作
            auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('👤 用户已登录:', user.email);
                } else {
                    console.log('👤 用户未登录');
                }
            });
            
            // 创建全局Firebase服务对象
            window.simpleFirebaseService = {
                app: app,
                auth: auth,
                isInitialized: true,
                
                // 简化的Google登录方法
                async signInWithGoogle() {
                    console.log('🔐 开始Google登录...');
                    
                    const provider = new firebase.auth.GoogleAuthProvider();
                    provider.addScope('email');
                    provider.addScope('profile');
                    
                    try {
                        const result = await auth.signInWithPopup(provider);
                        console.log('✅ Google登录成功:', result.user.email);
                        return result;
                    } catch (error) {
                        console.error('❌ Google登录失败:', error);
                        throw error;
                    }
                },
                
                // 简化的登出方法
                async signOut() {
                    try {
                        await auth.signOut();
                        console.log('✅ 登出成功');
                    } catch (error) {
                        console.error('❌ 登出失败:', error);
                        throw error;
                    }
                }
            };
            
            console.log('✅ 简化Firebase初始化完成！');
            
            // 发送成功事件
            window.dispatchEvent(new CustomEvent('simpleFirebaseReady', {
                detail: { service: window.simpleFirebaseService }
            }));
            
            return true;
            
        } catch (error) {
            console.error('❌ 简化Firebase初始化失败:', error);
            
            // 发送失败事件
            window.dispatchEvent(new CustomEvent('simpleFirebaseError', {
                detail: { error: error.message }
            }));
            
            return false;
        }
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFirebase);
    } else {
        // 如果页面已经加载完成，立即初始化
        setTimeout(initializeFirebase, 100);
    }
    
    // 导出简化的Google登录函数
    window.simpleGoogleLogin = async function() {
        try {
            if (!window.simpleFirebaseService?.isInitialized) {
                console.log('🔄 Firebase未初始化，尝试重新初始化...');
                const success = await initializeFirebase();
                if (!success) {
                    throw new Error('Firebase初始化失败');
                }
            }
            
            return await window.simpleFirebaseService.signInWithGoogle();
            
        } catch (error) {
            console.error('❌ 简化Google登录失败:', error);
            
            // 提供具体的错误信息
            let userMessage = 'Google登录失败';
            if (error.code === 'auth/popup-closed-by-user') {
                userMessage = '登录窗口被关闭，请重试';
            } else if (error.code === 'auth/popup-blocked') {
                userMessage = '登录弹窗被拦截，请允许弹窗后重试';
            } else if (error.message.includes('network')) {
                userMessage = '网络连接失败，请检查网络后重试';
            }
            
            alert(userMessage + '\n\n详细错误: ' + error.message);
            throw error;
        }
    };
    
    console.log('🔥 简化Firebase初始化脚本已加载');
    
})();
