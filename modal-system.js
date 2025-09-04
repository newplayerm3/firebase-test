// 优化的弹窗和提醒系统
class ModalSystem {
    constructor() {
        this.activeModals = new Set();
        this.activeNotifications = new Set();
        this.init();
    }

    init() {
        this.createStyles();
        this.bindEvents();
        console.log('🎭 Modal System initialized');
    }

    // 创建样式
    createStyles() {
        if (document.getElementById('modal-system-styles')) return;

        const style = document.createElement('style');
        style.id = 'modal-system-styles';
        style.textContent = `
            /* 弹窗遮罩 */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .modal-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            /* 弹窗容器 */
            .modal-container {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 90vw;
                max-height: 90vh;
                overflow: hidden;
                transform: scale(0.9) translateY(20px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                animation: modalSlideIn 0.3s ease-out;
            }

            .modal-overlay.show .modal-container {
                transform: scale(1) translateY(0);
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            /* 确认弹窗 */
            .confirm-modal {
                width: 400px;
                padding: 0;
            }

            .confirm-header {
                padding: 24px 24px 16px;
                border-bottom: 1px solid #f1f5f9;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .confirm-icon {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                margin: 0 auto 12px;
            }

            .confirm-title {
                font-size: 20px;
                font-weight: 600;
                text-align: center;
                margin: 0;
            }

            .confirm-body {
                padding: 24px;
                text-align: center;
            }

            .confirm-message {
                font-size: 16px;
                color: #64748b;
                line-height: 1.6;
                margin: 0;
            }

            .confirm-actions {
                padding: 16px 24px 24px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .modal-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 80px;
            }

            .modal-btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .modal-btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .modal-btn-secondary {
                background: #f1f5f9;
                color: #64748b;
            }

            .modal-btn-secondary:hover {
                background: #e2e8f0;
                transform: translateY(-1px);
            }

            .modal-btn-danger {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
            }

            .modal-btn-danger:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            }

            /* 通知系统 */
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            }

            .notification {
                background: white;
                border-radius: 12px;
                padding: 16px 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                border-left: 4px solid #3b82f6;
                max-width: 400px;
                min-width: 320px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                pointer-events: auto;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification.hide {
                transform: translateX(100%);
                opacity: 0;
            }

            .notification-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
                margin-top: 2px;
            }

            .notification-content {
                flex: 1;
                min-width: 0;
            }

            .notification-title {
                font-size: 14px;
                font-weight: 600;
                color: #1e293b;
                margin: 0 0 4px;
            }

            .notification-message {
                font-size: 13px;
                color: #64748b;
                line-height: 1.4;
                margin: 0;
            }

            .notification-close {
                width: 20px;
                height: 20px;
                border: none;
                background: none;
                color: #94a3b8;
                cursor: pointer;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                flex-shrink: 0;
                transition: all 0.2s ease;
            }

            .notification-close:hover {
                background: #f1f5f9;
                color: #64748b;
            }

            /* 通知类型样式 */
            .notification.success {
                border-left-color: #10b981;
            }

            .notification.success .notification-icon {
                background: #dcfce7;
                color: #16a34a;
            }

            .notification.error {
                border-left-color: #ef4444;
            }

            .notification.error .notification-icon {
                background: #fef2f2;
                color: #dc2626;
            }

            .notification.warning {
                border-left-color: #f59e0b;
            }

            .notification.warning .notification-icon {
                background: #fef3c7;
                color: #d97706;
            }

            .notification.info {
                border-left-color: #3b82f6;
            }

            .notification.info .notification-icon {
                background: #dbeafe;
                color: #2563eb;
            }

            /* 加载状态 */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(2px);
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .loading-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f4f6;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loading-text {
                margin-top: 16px;
                color: #64748b;
                font-size: 14px;
                text-align: center;
            }

            /* 响应式设计 */
            @media (max-width: 480px) {
                .modal-container {
                    width: 95vw;
                    margin: 20px;
                }

                .confirm-modal {
                    width: 100%;
                }

                .notification {
                    max-width: calc(100vw - 40px);
                    min-width: calc(100vw - 40px);
                }

                .notification-container {
                    left: 20px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 绑定全局事件
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });
    }

    // 显示确认弹窗
    showConfirm({
        title = '确认操作',
        message = '您确定要执行此操作吗？',
        icon = '❓',
        confirmText = '确认',
        cancelText = '取消',
        type = 'primary', // primary, danger
        onConfirm = () => {},
        onCancel = () => {}
    }) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-container confirm-modal">
                    <div class="confirm-header">
                        <div class="confirm-icon">${icon}</div>
                        <h3 class="confirm-title">${title}</h3>
                    </div>
                    <div class="confirm-body">
                        <p class="confirm-message">${message}</p>
                    </div>
                    <div class="confirm-actions">
                        <button class="modal-btn modal-btn-secondary cancel-btn">${cancelText}</button>
                        <button class="modal-btn modal-btn-${type} confirm-btn">${confirmText}</button>
                    </div>
                </div>
            `;

            const confirmBtn = overlay.querySelector('.confirm-btn');
            const cancelBtn = overlay.querySelector('.cancel-btn');

            const handleConfirm = () => {
                this.closeModal(overlay);
                onConfirm();
                resolve(true);
            };

            const handleCancel = () => {
                this.closeModal(overlay);
                onCancel();
                resolve(false);
            };

            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) handleCancel();
            });

            document.body.appendChild(overlay);
            this.activeModals.add(overlay);

            // 显示动画
            requestAnimationFrame(() => {
                overlay.classList.add('show');
            });
        });
    }

    // 显示提醒弹窗
    showAlert({
        title = '提示',
        message = '',
        icon = 'ℹ️',
        buttonText = '确定',
        type = 'info'
    }) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-container confirm-modal">
                    <div class="confirm-header">
                        <div class="confirm-icon">${icon}</div>
                        <h3 class="confirm-title">${title}</h3>
                    </div>
                    <div class="confirm-body">
                        <p class="confirm-message">${message}</p>
                    </div>
                    <div class="confirm-actions">
                        <button class="modal-btn modal-btn-primary ok-btn">${buttonText}</button>
                    </div>
                </div>
            `;

            const okBtn = overlay.querySelector('.ok-btn');

            const handleOk = () => {
                this.closeModal(overlay);
                resolve(true);
            };

            okBtn.addEventListener('click', handleOk);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) handleOk();
            });

            document.body.appendChild(overlay);
            this.activeModals.add(overlay);

            requestAnimationFrame(() => {
                overlay.classList.add('show');
            });
        });
    }

    // 显示通知
    showNotification({
        title = '',
        message = '',
        type = 'info', // success, error, warning, info
        duration = 4000,
        closable = true
    }) {
        // 确保通知容器存在
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type]}</div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            ${closable ? '<button class="notification-close">×</button>' : ''}
        `;

        // 关闭按钮事件
        if (closable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                this.closeNotification(notification);
            });
        }

        container.appendChild(notification);
        this.activeNotifications.add(notification);

        // 显示动画
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.closeNotification(notification);
            }, duration);
        }

        return notification;
    }

    // 显示加载状态
    showLoading(message = '加载中...') {
        const existingOverlay = document.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.querySelector('.loading-text').textContent = message;
            return existingOverlay;
        }

        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div>
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        return overlay;
    }

    // 隐藏加载状态
    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }

    // 关闭弹窗
    closeModal(modal) {
        modal.classList.remove('show');
        this.activeModals.delete(modal);
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // 关闭通知
    closeNotification(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        this.activeNotifications.delete(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }

    // 关闭最顶层的弹窗
    closeTopModal() {
        const modals = Array.from(this.activeModals);
        if (modals.length > 0) {
            this.closeModal(modals[modals.length - 1]);
        }
    }

    // 关闭所有弹窗
    closeAllModals() {
        this.activeModals.forEach(modal => {
            this.closeModal(modal);
        });
    }

    // 关闭所有通知
    clearAllNotifications() {
        this.activeNotifications.forEach(notification => {
            this.closeNotification(notification);
        });
    }
}

// 创建全局实例
const modalSystem = new ModalSystem();

// 便捷方法
window.showConfirm = (options) => modalSystem.showConfirm(options);
window.showAlert = (options) => modalSystem.showAlert(options);
window.showNotification = (options) => modalSystem.showNotification(options);
window.showLoading = (message) => modalSystem.showLoading(message);
window.hideLoading = () => modalSystem.hideLoading();

// 兼容旧的 showNotificationMessage 函数
window.showNotificationMessage = (message, type = 'info', title = '') => {
    return modalSystem.showNotification({
        title: title,
        message: message,
        type: type
    });
};

// 导出模块
window.ModalSystem = ModalSystem;
window.modalSystem = modalSystem;

console.log('🎭 Enhanced Modal System loaded successfully');
