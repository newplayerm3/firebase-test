# 🚀 Netlify 自动部署指南

本文档说明如何使用GitHub Actions自动将智能升学助手项目部署到Netlify。

## 📋 前置条件

### 1. GitHub Secrets 配置

在你的GitHub仓库中，需要配置以下两个秘密变量：

1. **导航到仓库设置**:
   - 进入你的GitHub仓库
   - 点击 `Settings` 选项卡
   - 在左侧菜单中选择 `Secrets and variables` → `Actions`

2. **添加以下Secrets**:
   
   | Secret名称 | 值 | 描述 |
   |-----------|---|------|
   | `USER_WITH_TOKEN` | 你的Netlify个人访问令牌 | 用于认证Netlify API |
   | `SMARTCOLLEGE810429` | 你的Netlify站点ID | 指定要部署到的站点 |

### 2. 获取Netlify凭据

#### 获取Netlify个人访问令牌 (USER_WITH_TOKEN)
1. 登录到 [Netlify](https://netlify.com)
2. 进入 `User settings` → `Applications`
3. 在 `Personal access tokens` 部分点击 `New access token`
4. 输入描述（如："Smart College GitHub Actions"）
5. 复制生成的令牌

#### 获取Netlify站点ID (SMARTCOLLEGE810429)
1. 在Netlify控制台中选择你的站点
2. 进入 `Site settings` → `General`
3. 在 `Site details` 部分找到 `Site ID`
4. 复制站点ID

## 🔄 部署触发条件

工作流会在以下情况下自动触发：

- ✅ **推送到main分支** - 自动部署到生产环境
- ✅ **创建Pull Request到main分支** - 创建预览部署
- ✅ **手动触发** - 在GitHub Actions页面手动运行

## 📁 部署流程

### 1. 代码检出
- 获取最新的代码
- 包含完整的Git历史

### 2. 环境准备
- 设置Node.js 18环境
- 安装必要的依赖（如果存在）

### 3. 构建准备
工作流会自动复制以下文件到部署目录：
- `index.html` - 主页面
- `assets/` - 静态资源
- `config.js` - 配置文件
- `firebase-*.js` - Firebase相关文件
- 其他必要的HTML文件

### 4. 配置文件生成
自动创建 `netlify.toml` 配置文件，包含：
- SPA路由重定向规则
- 安全头设置
- 静态资源缓存策略
- CSP（内容安全策略）配置

### 5. 部署到Netlify
- 使用官方Netlify GitHub Action
- 支持预览部署和生产部署
- 自动更新部署状态

## 🎯 部署结果

### 成功部署
- ✅ GitHub上会显示绿色的部署状态
- 🌐 站点会在Netlify上自动更新
- 💬 PR会收到部署成功的评论（包含预览链接）

### 部署失败
- ❌ GitHub上会显示红色的部署状态
- 📝 查看Actions日志获取详细错误信息
- 🛠️ 常见问题解决方案会在日志中显示

## 🔧 故障排除

### 常见问题

1. **认证失败**
   ```
   Error: Invalid credentials
   ```
   **解决方案**: 检查 `USER_WITH_TOKEN` 是否正确设置

2. **站点不存在**
   ```
   Error: Site not found
   ```
   **解决方案**: 检查 `SMARTCOLLEGE810429` 是否为正确的站点ID

3. **权限不足**
   ```
   Error: Insufficient permissions
   ```
   **解决方案**: 确保Netlify令牌有足够的权限

### 调试步骤

1. **检查GitHub Secrets**
   - 确保变量名完全匹配（区分大小写）
   - 确保值没有多余的空格

2. **检查Netlify设置**
   - 确认站点存在且可访问
   - 确认令牌有效且未过期

3. **查看详细日志**
   - 在GitHub仓库的Actions页面查看详细日志
   - 查找具体的错误信息

## 📚 相关文档

- [Netlify部署文档](https://docs.netlify.com/site-deploys/overview/)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Netlify Actions插件](https://github.com/nwtgck/actions-netlify)

## 🆘 获取帮助

如果遇到问题：
1. 查看GitHub Actions的详细日志
2. 检查Netlify的部署日志
3. 确认所有配置都正确设置
4. 参考本文档的故障排除部分

---

🌟 **配置完成后，每次推送代码到main分支，你的智能升学助手网站就会自动部署到Netlify！**
