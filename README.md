# Smart College Advisor - AI驱动的升学规划平台

[![Deploy to Netlify](https://github.com/your-username/your-repo-name/workflows/Deploy%20to%20Netlify/badge.svg)](https://github.com/your-username/your-repo-name/actions)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-netlify-site-id/deploy-status.svg)](https://app.netlify.com/sites/your-netlify-site-name/deploys)

这是一个基于 Firebase 和 AI 技术的现代化升学规划平台，集成了谷歌登录、2brain AI对话、智能题库等功能，支持自动部署到 Netlify。

## 🚀 功能特性

- ✅ **AI智能助手**: 集成2brain API的专业升学顾问
- ✅ **流式对话**: 实时显示AI思考和回复过程
- ✅ **Markdown支持**: 完整的格式化文本和代码高亮
- ✅ **Firebase认证**: 支持谷歌登录、邮箱密码、访客模式
- ✅ **用户信息存储**: 用户数据自动保存到 Firebase Firestore
- ✅ **智能题库**: 海量题目资源，支持筛选和搜索
- ✅ **申请策略**: 完整的升学规划和时间管理
- ✅ **响应式设计**: 支持桌面端、平板、手机全设备
- ✅ **自动部署**: GitHub Actions自动部署到Netlify
- ✅ **现代化UI**: 3D效果、动画、渐变的专业界面

## 📋 项目结构

```
firebase-google-auth-web/
├── index.html          # 主页面文件
├── app.js             # 应用主逻辑和Firebase配置
├── styles.css         # 自定义样式文件
├── package.json       # 项目配置和依赖
├── netlify.toml       # Netlify部署配置
├── _redirects         # Netlify重定向规则
└── README.md          # 项目文档
```

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **AI服务**: 2brain API (GPT-3.5-turbo)
- **样式**: Tailwind CSS + 自定义CSS
- **认证**: Firebase Authentication (Google + Email)
- **数据库**: Firebase Firestore
- **格式化**: Marked.js + Prism.js
- **部署**: Netlify + GitHub Actions
- **CDN**: Firebase SDK via CDN

## 📦 安装和运行

### 1. 克隆项目

```bash
git clone https://github.com/your-username/firebase-google-auth-web.git
cd firebase-google-auth-web
```

### 2. 配置 Firebase

1. 在 [Firebase Console](https://console.firebase.google.com/) 创建新项目
2. 启用 Authentication 服务并配置谷歌登录提供商
3. 创建 Firestore 数据库
4. 获取 Firebase 配置信息
5. 更新 `app.js` 中的 `firebaseConfig` 对象

### 3. 本地运行

```bash
# 安装依赖（可选，仅用于开发服务器）
npm install

# 启动本地服务器
npm start
# 或者
npm run dev

# 应用将在 http://localhost:3000 运行
```

### 4. 部署到 Netlify

#### 方法一：自动部署（推荐）

1. **配置GitHub Secrets**：
   ```
   NETLIFY_TOKEN: 您的Netlify访问令牌
   NETLIFY_PROJECT_ID: 您的Netlify站点ID
   ```

2. **推送代码到GitHub**：
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

3. **自动部署**：GitHub Actions会自动触发部署流程

#### 方法二：通过 Git 连接

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 [Netlify](https://netlify.com) 创建新站点
3. 连接你的 Git 仓库
4. 部署设置会自动从 `netlify.toml` 读取
5. 部署完成！

#### 方法三：手动部署

1. 在项目根目录运行：
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

2. 按提示选择部署目录（选择当前目录 `.`）

> 📋 **详细配置指南**：请查看 [DEPLOYMENT.md](DEPLOYMENT.md) 获取完整的自动部署配置说明。

## 🔧 Firebase 配置

### Authentication 设置

1. 在 Firebase Console 中启用 Authentication
2. 在 "Sign-in method" 标签页中启用 Google 提供商
3. 配置授权域名（添加你的 Netlify 域名）

### Firestore 数据库设置

1. 创建 Firestore 数据库（生产模式）
2. 设置安全规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能读写自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // 用户活动记录
      match /activities/{activityId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 📊 数据结构

### 用户文档 (`users/{uid}`)

```javascript
{
  uid: "用户唯一ID",
  displayName: "用户显示名称",
  email: "用户邮箱",
  photoURL: "用户头像URL",
  createdAt: "创建时间戳",
  lastLogin: "最后登录时间戳",
  loginCount: "登录次数",
  updatedAt: "更新时间戳"
}
```

### 活动记录 (`users/{uid}/activities/{activityId}`)

```javascript
{
  type: "活动类型 (login)",
  timestamp: "时间戳",
  userAgent: "用户代理字符串",
  ip: "IP地址（如果可用）"
}
```

## 🎨 自定义样式

项目使用 Tailwind CSS 作为主要样式框架，同时在 `styles.css` 中添加了自定义样式：

- 淡入动画效果
- 加载动画
- 悬停效果
- 响应式设计优化
- 错误消息动画

## 🔒 安全性

- ✅ Firebase Security Rules 保护数据
- ✅ HTTPS 强制重定向
- ✅ 安全头部配置
- ✅ XSS 保护
- ✅ 内容类型验证
- ✅ 权限策略设置

## 🚀 性能优化

- ✅ CDN 加载 Firebase SDK
- ✅ 静态资源缓存配置
- ✅ 图片懒加载
- ✅ 代码分割（ES6 模块）
- ✅ 压缩和优化

## 📱 响应式支持

- ✅ 移动端优先设计
- ✅ 平板和桌面端适配
- ✅ 触摸友好的交互
- ✅ 自适应布局

## 🔧 环境变量

在 Netlify 部署时，可以设置以下环境变量：

- `NODE_ENV`: 环境模式 (production/development)
- 其他自定义配置变量

## 📝 开发指南

### 添加新功能

1. 在 `app.js` 中添加新的函数
2. 更新 HTML 结构（如需要）
3. 添加相应的样式
4. 测试功能
5. 更新文档

### 调试技巧

1. 打开浏览器开发者工具
2. 查看 Console 面板的日志信息
3. 检查 Network 面板的网络请求
4. 使用 Firebase Console 查看数据库状态

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 问题和支持

如果遇到问题，请：

1. 查看浏览器控制台的错误信息
2. 检查 Firebase 配置是否正确
3. 确认网络连接正常
4. 查看 Firebase Console 的使用情况和配额

## 📞 联系方式

- 项目作者: Your Name
- 邮箱: your.email@example.com
- GitHub: [@your-username](https://github.com/your-username)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
