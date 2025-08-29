# Firebase Google登录系统

一个基于Python Flask的Web应用，集成了Firebase Google登录和邮箱密码注册功能。

## 🚀 功能特性

- ✅ **Google OAuth登录** - 使用Firebase Authentication
- ✅ **邮箱密码注册** - 自定义用户注册系统
- ✅ **邮箱密码登录** - 支持已注册用户登录
- ✅ **用户数据存储** - 使用Firebase Firestore数据库
- ✅ **会话管理** - 基于Flask-Login的用户会话
- ✅ **响应式UI** - 使用Bootstrap 5的现代化界面

## 🛠️ 技术栈

- **后端**: Python Flask
- **认证**: Firebase Authentication
- **数据库**: Firebase Firestore
- **前端**: HTML5, CSS3, JavaScript
- **UI框架**: Bootstrap 5
- **会话管理**: Flask-Login

## 📋 系统要求

- Python 3.7+
- Firebase项目
- 现代浏览器

## 🔧 安装和配置

### 1. 克隆仓库
```bash
git clone https://github.com/newplayerm3/firebase-test.git
cd firebase-test
```

### 2. 安装依赖
```bash
pip install -r requirements.txt
```

### 3. 配置Firebase
1. 在 [Firebase Console](https://console.firebase.google.com/) 创建项目
2. 下载服务账户密钥文件
3. 重命名为 `firebase-service-account.json`
4. 在 `app.py` 中更新Firebase配置

### 4. 运行应用
```bash
python app.py
```

应用将在 `http://localhost:3000` 启动

## 🌐 使用说明

### 注册新用户
1. 访问 `/register` 页面
2. 填写邮箱、密码和显示名称
3. 点击注册按钮

### Google登录
1. 访问 `/login` 页面
2. 点击"使用Google账号登录"
3. 选择Google账号并授权

### 邮箱密码登录
1. 访问 `/login` 页面
2. 在表单中输入邮箱和密码
3. 点击登录按钮

## 📁 项目结构

```
firebase-test/
├── app.py                          # 主应用文件
├── requirements.txt                # Python依赖
├── firebase-service-account.json  # Firebase服务账户密钥
├── templates/                     # HTML模板
│   ├── base.html                 # 基础模板
│   ├── index.html                # 首页
│   ├── login.html                # 登录页面
│   ├── register.html             # 注册页面
│   └── dashboard.html            # 用户控制台
└── README.md                     # 项目说明
```

## 🔒 安全注意事项

- 不要将 `firebase-service-account.json` 提交到版本控制
- 在生产环境中使用环境变量存储敏感信息
- 定期更新依赖包以修复安全漏洞

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请通过GitHub Issues联系。

