# 🔥 Firebase 服务配置指南

## 📋 概述

本指南将帮助您完成智能升学助手项目的Firebase服务配置。

**项目信息:**
- 项目ID: `test-base-a7c4b`
- 应用ID: `1:445324851190:web:35ab87f493ec126265f9d7`

---

## 🚀 第一步：Firebase控制台基础设置

### 1. 访问Firebase控制台
- 打开 [Firebase控制台](https://console.firebase.google.com)
- 选择项目 `test-base-a7c4b`

### 2. 启用必要的服务

#### 🔐 Authentication (认证服务)
1. 左侧菜单 → **Authentication** → **Get started**
2. 选择 **Sign-in method** 标签
3. 启用以下登录方式:

**📧 Email/Password:**
```
状态: 启用
设置: 允许用户使用邮箱和密码注册
```

**🌐 Google:**
```
状态: 启用
项目支持邮箱: 选择您的Gmail邮箱
项目公开名称: 智能升学助手
```

**👤 Anonymous:**
```
状态: 启用
设置: 允许匿名用户访问
```

#### 💾 Firestore Database
1. 左侧菜单 → **Firestore Database** → **Create database**
2. 选择 **Start in test mode** (开发阶段)
3. 选择服务器位置: **asia-east1 (台湾)** 或 **us-central1**

**安全规则 (开发阶段):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允许所有读写操作 (仅用于开发)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### 📁 Storage
1. 左侧菜单 → **Storage** → **Get started**
2. 选择 **Start in test mode**
3. 选择存储位置: **asia-east1** 或 **us-central1**

**安全规则 (开发阶段):**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 🔧 第二步：域名授权配置

### 1. 添加授权域名
**路径**: Authentication → Settings → Authorized domains

**需要添加的域名:**
```
localhost
127.0.0.1
test-base-a7c4b.firebaseapp.com
你的自定义域名 (如果有)
```

### 2. OAuth重定向URI配置
**路径**: Google Cloud Console → APIs & Services → Credentials

**需要添加的重定向URI:**
```
http://localhost:8000/__/auth/handler
http://127.0.0.1:8000/__/auth/handler  
https://test-base-a7c4b.firebaseapp.com/__/auth/handler
```

---

## 📊 第三步：数据库结构设置

### Firestore 集合结构

#### 👥 users (用户信息)
```javascript
{
  uid: "用户唯一ID",
  email: "用户邮箱",
  displayName: "显示名称",
  photoURL: "头像URL",
  createdAt: "创建时间",
  lastLoginAt: "最后登录时间",
  profile: {
    grade: "年级",
    interests: ["兴趣领域"],
    targetUniversities: ["目标大学"],
    currentGPA: "当前GPA"
  },
  progress: {
    consultationCount: "咨询次数",
    completedModules: ["已完成模块"],
    achievements: ["获得成就"],
    totalPoints: "总积分"
  }
}
```

#### 💬 chat_history (聊天记录)
```javascript
{
  userId: "用户ID",
  sessionId: "会话ID",
  messages: [
    {
      role: "user|assistant",
      content: "消息内容",
      timestamp: "时间戳"
    }
  ],
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

#### 🎯 user_progress (用户进度)
```javascript
{
  userId: "用户ID",
  moduleId: "模块ID",
  progress: "进度百分比",
  completedTasks: ["已完成任务"],
  lastAccessAt: "最后访问时间",
  timeSpent: "花费时间(分钟)"
}
```

---

## 🔒 第四步：安全规则配置 (生产环境)

### Firestore 生产安全规则
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 聊天记录访问控制
    match /chat_history/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // 用户进度访问控制
    match /user_progress/{progressId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // 公共数据只读
    match /public_data/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Storage 生产安全规则
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 用户头像上传
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 2 * 1024 * 1024; // 2MB限制
    }
    
    // 用户文档上传
    match /documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024; // 10MB限制
    }
  }
}
```

---

## 🧪 第五步：测试连接

### 1. 使用测试页面
```bash
open firebase-connection-test.html
```

### 2. 测试项目清单
- [ ] Firebase SDK加载
- [ ] 项目连接成功
- [ ] 认证服务正常
- [ ] Google登录可用
- [ ] 匿名登录可用
- [ ] Firestore读写正常
- [ ] Storage上传下载正常

### 3. 常见错误解决

**错误: "Firebase SDK failed to load"**
```
解决方案:
1. 检查网络连接
2. 确认CDN链接可访问
3. 尝试刷新页面
```

**错误: "This domain is not authorized"**
```
解决方案:
1. 在Firebase控制台添加当前域名到授权列表
2. 检查OAuth重定向URI配置
3. 等待配置生效 (可能需要几分钟)
```

**错误: "Permission denied"**
```
解决方案:
1. 检查Firestore安全规则
2. 确认用户已正确认证
3. 验证数据访问权限
```

---

## 📈 第六步：性能优化

### 1. 索引优化
**路径**: Firestore → Indexes

**建议创建的复合索引:**
```javascript
// 用户聊天记录查询
Collection: chat_history
Fields: userId (Ascending), createdAt (Descending)

// 用户进度查询  
Collection: user_progress
Fields: userId (Ascending), moduleId (Ascending)
```

### 2. 缓存策略
```javascript
// 启用离线持久化
firebase.firestore().enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('多个标签页打开，持久化失败');
    } else if (err.code == 'unimplemented') {
      console.log('浏览器不支持持久化');
    }
  });
```

### 3. 连接池优化
```javascript
// 配置连接设置
const settings = {
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
  merge: true
};
firebase.firestore().settings(settings);
```

---

## 🔄 第七步：备份和监控

### 1. 数据备份
**路径**: Firestore → Backup

**建议设置:**
- 自动备份频率: 每日
- 保留时间: 30天
- 备份范围: 所有集合

### 2. 监控告警
**路径**: Firebase → Project Settings → Integrations

**推荐集成:**
- Google Cloud Monitoring
- Error Reporting
- Performance Monitoring

---

## 📞 技术支持

### 常用链接
- [Firebase文档](https://firebase.google.com/docs)
- [Firebase控制台](https://console.firebase.google.com)
- [Google Cloud Console](https://console.cloud.google.com)

### 故障排除
如果遇到问题:
1. 查看浏览器控制台错误信息
2. 检查Firebase控制台日志
3. 参考 `FIREBASE_TROUBLESHOOTING.md`
4. 运行 `firebase-connection-test.html` 诊断

---

**🎉 完成以上配置后，您的Firebase服务就可以正常使用了！**

记得在生产环境中更新安全规则，确保数据安全。
