/**
 * Firebase在线模式管理
 * 确保Firebase始终保持在线状态，不自动切换到离线模式
 */

(function() {
    'use strict';

    console.log('🔥 Firebase在线模式管理器启动...');

    const firebaseOnlineManager = {
        retryCount: 0,
        maxRetries: 10,
        retryInterval: 3000, // 3秒重试间隔

        // 初始化在线模式管理
        init: function() {
            console.log('🌐 初始化Firebase在线模式管理器...');
            
            // 监听页面可见性变化，重新尝试连接
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && (!window.firebaseService || !window.firebaseService.isInitialized)) {
                    console.log('📱 页面重新可见，尝试重新连接Firebase...');
                    this.attemptFirebaseConnection();
                }
            });

            // 定期检查Firebase连接状态
            this.startConnectionMonitor();
            
            // 立即尝试连接
            this.attemptFirebaseConnection();
        },

        // 启动连接监控
        startConnectionMonitor: function() {
            setInterval(() => {
                if (!window.firebaseService || !window.firebaseService.isInitialized) {
                    console.log('🔄 定期检查：Firebase未连接，尝试重新连接...');
                    this.attemptFirebaseConnection();
                }
            }, 30000); // 每30秒检查一次
        },

        // 尝试Firebase连接
        attemptFirebaseConnection: async function() {
            if (this.retryCount >= this.maxRetries) {
                console.log('⚠️ Firebase连接重试次数已达上限，但继续保持在线模式');
                return;
            }

            try {
                console.log(`🔥 尝试Firebase连接 (第${this.retryCount + 1}次)...`);
                
                // 检查Firebase SDK是否已加载
                if (typeof firebase === 'undefined') {
                    console.log('⚠️ Firebase SDK未加载，等待加载...');
                    await this.waitForFirebaseSDK();
                }

                // 检查配置是否可用
                if (!window.CONFIG || !window.CONFIG.firebase || !window.CONFIG.firebase.config) {
                    console.log('⚠️ Firebase配置未找到，等待配置加载...');
                    await this.waitForConfig();
                }

                // 尝试初始化Firebase服务
                if (!window.firebaseService) {
                    console.log('🚀 创建新的Firebase服务实例...');
                    window.firebaseService = new window.FirebaseService();
                }

                // 等待初始化完成
                await this.waitForInitialization();
                
                if (window.firebaseService && window.firebaseService.isInitialized) {
                    console.log('✅ Firebase连接成功！');
                    this.retryCount = 0; // 重置重试计数
                    this.onConnectionSuccess();
                } else {
                    throw new Error('Firebase初始化失败');
                }

            } catch (error) {
                this.retryCount++;
                console.error(`❌ Firebase连接失败 (第${this.retryCount}次):`, error);
                
                if (this.retryCount < this.maxRetries) {
                    console.log(`⏰ ${this.retryInterval / 1000}秒后重试...`);
                    setTimeout(() => {
                        this.attemptFirebaseConnection();
                    }, this.retryInterval);
                } else {
                    console.log('⚠️ Firebase连接重试已达上限，但保持在线模式等待手动重试');
                    this.showManualRetryOption();
                }
            }
        },

        // 等待Firebase SDK加载
        waitForFirebaseSDK: function(timeout = 10000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                
                const checkSDK = () => {
                    if (typeof firebase !== 'undefined') {
                        resolve();
                        return;
                    }
                    
                    if (Date.now() - startTime > timeout) {
                        reject(new Error('Firebase SDK加载超时'));
                        return;
                    }
                    
                    setTimeout(checkSDK, 500);
                };
                
                checkSDK();
            });
        },

        // 等待配置加载
        waitForConfig: function(timeout = 5000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                
                const checkConfig = () => {
                    if (window.CONFIG && window.CONFIG.firebase && window.CONFIG.firebase.config) {
                        resolve();
                        return;
                    }
                    
                    if (Date.now() - startTime > timeout) {
                        reject(new Error('Firebase配置加载超时'));
                        return;
                    }
                    
                    setTimeout(checkConfig, 200);
                };
                
                checkConfig();
            });
        },

        // 等待初始化完成
        waitForInitialization: function(timeout = 15000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                
                const checkInit = () => {
                    if (window.firebaseService && window.firebaseService.isInitialized) {
                        resolve();
                        return;
                    }
                    
                    if (Date.now() - startTime > timeout) {
                        reject(new Error('Firebase初始化超时'));
                        return;
                    }
                    
                    setTimeout(checkInit, 500);
                };
                
                checkInit();
            });
        },

        // 连接成功处理
        onConnectionSuccess: function() {
            console.log('🎉 Firebase连接成功，启用所有功能...');
            
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
                btn.title = '';
            });

            // 显示连接成功消息
            if (window.showNotificationMessage) {
                window.showNotificationMessage('🔥 Firebase服务已连接，所有功能可用！', 'success');
            }

            // 触发Firebase初始化事件
            window.dispatchEvent(new CustomEvent('firebaseInitialized', {
                detail: { service: window.firebaseService }
            }));
        },

        // 显示手动重试选项
        showManualRetryOption: function() {
            // 在页面上添加重试按钮
            const retryBtn = document.createElement('button');
            retryBtn.innerHTML = '🔄 重新连接Firebase';
            retryBtn.className = 'btn btn-secondary';
            retryBtn.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                background: #f59e0b;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            `;
            
            retryBtn.onclick = () => {
                this.retryCount = 0; // 重置重试计数
                this.attemptFirebaseConnection();
                retryBtn.remove();
            };
            
            document.body.appendChild(retryBtn);
            
            // 5分钟后自动移除按钮
            setTimeout(() => {
                if (retryBtn.parentNode) {
                    retryBtn.remove();
                }
            }, 300000);
        },

        // 手动重新连接
        manualReconnect: function() {
            console.log('🔄 手动触发Firebase重新连接...');
            this.retryCount = 0;
            this.attemptFirebaseConnection();
        }
    };

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            firebaseOnlineManager.init();
        });
    } else {
        firebaseOnlineManager.init();
    }

    // 暴露到全局作用域
    window.firebaseOnlineManager = firebaseOnlineManager;
    
    // 添加手动重连的快捷方式
    window.reconnectFirebase = () => firebaseOnlineManager.manualReconnect();
    
    console.log('✅ Firebase在线模式管理器已就绪');
    console.log('💡 如需手动重连，请在控制台输入: reconnectFirebase()');

})();
