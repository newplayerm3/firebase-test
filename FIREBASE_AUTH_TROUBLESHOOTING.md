# Firebase认证故障排除指南

## 当前问题诊断

根据测试结果，以下两项认证服务失败：
- ❌ Google登录：失败
- ❌ 匿名登录：失败

## 解决方案

### 1. Google登录配置

#### 在Firebase控制台中检查：
1. 访问 [Firebase控制台](https://console.firebase.google.com/project/test-base-a7c4b)
2. 进入 **Authentication** > **Sign-in method**
3. 确保 **Google** 提供商已启用：
   - 点击 Google 提供商
   - 确保状态为 **已启用**
   - 检查项目支持电子邮件是否已设置
   - 确保Web SDK配置正确

#### 授权域名设置：
1. 在 **Authentication** > **Settings** > **Authorized domains**
2. 添加以下域名：
   - `localhost`
   - `127.0.0.1`
   - 您的实际域名（如果有）

### 2. 匿名登录配置

#### 在Firebase控制台中启用：
1. 访问 [Firebase控制台](https://console.firebase.google.com/project/test-base-a7c4b)
2. 进入 **Authentication** > **Sign-in method**
3. 找到 **匿名** 提供商
4. 点击并设置为 **已启用**

### 3. 项目配置检查

#### OAuth 2.0 客户端设置：
1. 访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=test-base-a7c4b)
2. 检查OAuth 2.0客户端ID
3. 确保已添加正确的重定向URI：
   - `http://localhost:8000`
   - `http://127.0.0.1:8000`
   - `https://test-base-a7c4b.firebaseapp.com`

### 4. 本地测试环境

确保在正确的端口运行：
```bash
# 使用Python启动本地服务器
python3 -m http.server 8000

# 或使用Node.js
npx http-server -p 8000
```

### 5. 浏览器控制台检查

打开浏览器开发者工具，查看控制台是否有以下错误：
- CORS错误
- 域名不匹配错误
- API密钥错误

## 快速修复步骤

1. **立即检查**: 打开Firebase控制台，确认Google和匿名登录都已启用
2. **添加域名**: 在授权域名中添加localhost和127.0.0.1
3. **重新测试**: 刷新测试页面，重新运行测试

## 联系支持

如果问题仍然存在，请检查：
- Firebase项目计费状态
- API配额限制
- 网络连接问题

---
*最后更新: $(date)*
