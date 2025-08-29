# GitHub 工作流配置说明

## 🚀 新工作流特性

### 工作流文件
- **文件名**: `.github/workflows/netlify-auto-deploy.yml`
- **功能**: 推送到main分支后自动部署到Netlify
- **状态**: ✅ 已创建并配置完成

## 🔧 环境变量配置

### 必需的GitHub Secrets
在您的GitHub仓库中，需要设置以下Secrets：

1. **NETLIFY_TOKEN**
   - 值: 您的Netlify个人访问令牌
   - 获取方式: Netlify → User Settings → Applications → Personal access tokens

2. **NETLIFY_PROJECT_ID**
   - 值: 您的Netlify项目ID
   - 获取方式: Netlify → Site Settings → General → Site information → Site ID

### 设置步骤
1. 进入GitHub仓库
2. 点击 `Settings` 标签
3. 左侧菜单选择 `Secrets and variables` → `Actions`
4. 点击 `New repository secret`
5. 添加上述两个Secrets

## 📋 工作流功能

### 触发条件
- ✅ 推送到 `main` 分支时自动触发
- ✅ 支持手动触发 (`workflow_dispatch`)

### 部署流程
1. **代码检出**: 获取完整的Git历史
2. **环境准备**: 设置Node.js 18环境
3. **文件准备**: 优先使用 `static-version/` 目录
4. **Netlify部署**: 使用官方Action进行部署
5. **状态反馈**: 在GitHub中显示部署状态

### 智能文件选择
- **优先**: 使用 `static-version/` 目录（如果存在）
- **备选**: 使用主项目文件
- **自动**: 生成必要的Netlify配置文件

## 🎯 部署配置

### Netlify配置
- **发布目录**: `./deploy`
- **生产分支**: `main`
- **构建命令**: 无（静态站点）
- **超时时间**: 10分钟

### 安全设置
- SPA路由重定向
- 安全头设置
- 内容安全策略
- 静态资源缓存优化

## 📱 使用方式

### 自动部署
1. 推送代码到 `main` 分支
2. 工作流自动触发
3. 查看Actions标签页的部署进度
4. 部署完成后在Netlify中查看结果

### 手动部署
1. 进入Actions标签页
2. 选择 `🚀 Netlify Auto Deploy` 工作流
3. 点击 `Run workflow`
4. 选择分支并运行

## 🔍 故障排除

### 常见问题
1. **Secrets未设置**: 确保 `NETLIFY_TOKEN` 和 `NETLIFY_PROJECT_ID` 已正确配置
2. **权限不足**: 检查Netlify令牌是否有足够的权限
3. **项目ID错误**: 验证Netlify项目ID是否正确

### 调试步骤
1. 查看Actions标签页的详细日志
2. 检查Netlify仪表板的部署状态
3. 验证GitHub Secrets设置
4. 确认Netlify项目配置

## 📚 相关链接

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Netlify 部署文档](https://docs.netlify.com/configure-builds/get-started/)
- [Netlify Actions 文档](https://github.com/nwtgck/actions-netlify)

## 🎉 部署成功标志

当看到以下信息时，表示部署成功：
```
🎉 Smart College Advisor deployed successfully!
🌐 Your site should be live at your Netlify domain
```

## 🔄 更新和维护

### 工作流更新
- 工作流文件位于 `.github/workflows/netlify-auto-deploy.yml`
- 修改后推送到main分支即可生效
- 支持热更新，无需重启

### 配置调整
- 修改 `netlify.toml` 文件调整Netlify配置
- 调整工作流文件中的部署参数
- 更新环境变量和超时设置

---

**注意**: 确保在推送代码前已正确设置GitHub Secrets，否则部署将失败。
