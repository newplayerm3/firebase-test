# 🚀 GitHub Actions + Netlify 自动部署指南

## 📋 概述

本项目配置了两个GitHub Actions工作流，用于自动部署到Netlify：

1. **完整版工作流** (`netlify-deploy.yml`) - 包含构建步骤和完整配置
2. **简化版工作流** (`netlify-simple.yml`) - 直接部署，适合静态网站

## 🔧 工作流配置

### 1. netlify-deploy.yml (推荐)

**功能特点：**
- ✅ 支持构建步骤
- ✅ 自动创建dist目录
- ✅ 复制必要文件
- ✅ 生成Netlify配置
- ✅ 支持PR预览部署
- ✅ 详细的部署日志

**触发条件：**
- 推送到 `main` 分支
- 创建针对 `main` 分支的Pull Request

### 2. netlify-simple.yml

**功能特点：**
- ✅ 简单直接
- ✅ 无构建步骤
- ✅ 快速部署
- ✅ 适合静态网站

**触发条件：**
- 推送到 `main` 分支

## 🔑 必需的GitHub Secrets

在GitHub仓库设置中配置以下Secrets：

### 1. USER_WITH_TOKEN
- **用途：** Netlify认证令牌
- **获取方式：**
  1. 登录 [Netlify](https://netlify.com)
  2. 进入 User Settings > Applications
  3. 点击 "New access token"
  4. 复制生成的token

### 2. SMART_COLLEGE_11451
- **用途：** Netlify站点ID
- **获取方式：**
  1. 在Netlify中选择你的站点
  2. 进入 Site Settings > General
  3. 找到 "Site details" 中的 "Site ID"
  4. 复制Site ID

## 📁 项目结构

```
考大学网站/
├── .github/
│   └── workflows/
│       ├── netlify-deploy.yml    # 完整版工作流
│       └── netlify-simple.yml    # 简化版工作流
├── netlify.toml                  # Netlify配置文件
├── index.html                    # 主页面
├── assets/                       # 静态资源
├── config.js                     # 配置文件
└── firebase-*.js                 # Firebase相关文件
```

## 🌐 部署流程

### 自动部署流程：

1. **代码推送** → GitHub仓库
2. **触发工作流** → GitHub Actions
3. **构建项目** → 准备部署文件
4. **部署到Netlify** → 自动发布
5. **更新状态** → GitHub commit状态

### 手动部署：

1. 进入GitHub仓库
2. 点击 "Actions" 标签
3. 选择工作流
4. 点击 "Run workflow"

## 🛠️ 配置说明

### netlify.toml 配置

```toml
[build]
  publish = "."                    # 发布根目录
  command = "echo 'Static site'"   # 构建命令

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200                     # SPA路由支持

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"       # 安全头部
```

## 🔍 故障排除

### 常见问题：

1. **部署失败 - 认证错误**
   ```
   解决方案：检查 USER_WITH_TOKEN 是否正确设置
   ```

2. **部署失败 - 站点ID错误**
   ```
   解决方案：检查 SMART_COLLEGE_11451 是否正确设置
   ```

3. **构建失败**
   ```
   解决方案：检查项目文件结构，确保所有必需文件存在
   ```

4. **页面404错误**
   ```
   解决方案：检查 netlify.toml 中的重定向规则
   ```

### 调试步骤：

1. **查看GitHub Actions日志**
   - 进入仓库 → Actions → 选择失败的工作流
   - 查看详细错误信息

2. **查看Netlify部署日志**
   - 登录Netlify → 选择站点 → Deploys
   - 查看部署详情和错误信息

3. **本地测试**
   ```bash
   # 启动本地服务器测试
   python3 -m http.server 8000
   open http://localhost:8000
   ```

## 📊 部署状态

工作流会自动：
- ✅ 更新GitHub commit状态
- ✅ 在PR中添加部署预览链接
- ✅ 发送部署成功/失败通知

## 🔗 有用链接

- [Netlify文档](https://docs.netlify.com/)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [项目仓库](https://github.com/jay451180/smart-college)
- [Netlify站点](https://smart-college-11451.netlify.app/)

## 🎯 下一步

1. **设置GitHub Secrets**
2. **推送代码到main分支**
3. **查看自动部署结果**
4. **配置自定义域名**（可选）

---

📝 **注意：** 确保所有敏感信息（API密钥、令牌等）都通过GitHub Secrets管理，不要直接提交到代码库中。
