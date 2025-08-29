# 🎯 智能升学助手 - 静态版本

这是智能升学助手项目的纯静态版本，专为Netlify等静态托管平台优化。

## ✨ 特性

- 🚀 **纯静态部署** - 无需服务器，CDN友好
- 📱 **响应式设计** - 支持所有设备
- 🎨 **现代化UI** - 美观的用户界面
- ⚡ **快速加载** - 优化的静态资源
- 🔒 **安全可靠** - 无后端依赖

## 📁 文件结构

```
static-version/
├── index.html              # 主页面
├── assets/                 # 静态资源
│   ├── css/
│   │   └── main.css       # 主样式文件
│   ├── js/
│   │   └── main.js        # 主JavaScript文件
│   └── images/            # 图片资源
├── netlify.toml           # Netlify配置
├── DEPLOYMENT.md          # 部署指南
└── README.md              # 本文件
```

## 🚀 快速部署

### 方法1：拖拽部署（推荐）

1. 访问 [Netlify](https://netlify.com)
2. 注册/登录账号
3. 点击 "Add new site" → "Deploy manually"
4. 将整个 `static-version` 文件夹拖拽到部署区域
5. 等待部署完成

### 方法2：GitHub集成

1. 将代码推送到GitHub
2. 在Netlify中连接GitHub仓库
3. 自动部署

## 🎯 功能说明

### ✅ 可用功能
- 🏠 主页展示
- 🔍 搜索功能（模拟）
- 📚 功能模块展示
- 📝 联系表单
- 📱 响应式导航
- 🎭 页面切换动画

### 🔄 静态化处理
- 移除Firebase认证
- 移除AI对话功能
- 移除实时数据库
- 移除支付功能

## 🛠️ 本地开发

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd static-version
   ```

2. **启动本地服务器**
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx serve .
   
   # 或使用PHP
   php -S localhost:8000
   ```

3. **访问网站**
   ```
   http://localhost:8000
   ```

## 📱 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🔧 自定义配置

### 修改网站信息
编辑 `index.html` 中的标题、描述等元信息。

### 修改联系信息
在 `index.html` 中搜索并替换联系信息。

### 修改大学数据
在 `assets/js/main.js` 中编辑 `universityData` 对象。

## 📊 性能优化

- 静态资源缓存
- 图片懒加载
- CSS/JS压缩
- 安全头部设置
- SPA路由支持

## 🌐 部署平台

- ✅ Netlify
- ✅ Vercel
- ✅ GitHub Pages
- ✅ GitLab Pages
- ✅ 任何静态托管服务

## 📞 支持

如有问题，请查看：
1. [部署指南](DEPLOYMENT.md)
2. Netlify官方文档
3. 项目GitHub Issues

## 📄 许可证

MIT License

---

**让AI助力您的升学之路，成就更好的未来！** 🌟
