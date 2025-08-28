# 🔧 Netlify自动部署故障排除指南

## ❓ 为什么我的代码没有自动部署？

### 📋 检查清单

#### 1. ✅ GitHub Secrets配置检查

访问你的GitHub仓库 → Settings → Secrets and variables → Actions，确认以下Secrets已正确设置：

**必需的Secrets：**
- `NETLIFY_AUTH_TOKEN` - 你的Netlify访问令牌
- `NETLIFY_SITE_ID` - 你的Netlify站点ID

#### 2. ✅ GitHub Actions状态检查

1. **查看工作流运行状态：**
   - 进入GitHub仓库
   - 点击 "Actions" 标签
   - 查看最近的工作流运行

2. **可能的状态：**
   - 🟢 **成功** - 部署完成
   - 🟡 **进行中** - 正在部署
   - 🔴 **失败** - 部署失败，需要查看错误日志

#### 3. ✅ 工作流触发条件检查

**当前配置的触发条件：**
- 推送代码到 `main` 分支
- 创建针对 `main` 分支的Pull Request

**确认方法：**
```bash
# 检查当前分支
git branch

# 确认在main分支
git checkout main

# 推送到main分支
git push origin main
```

## 🐛 常见问题及解决方案

### 问题1: Secrets未设置或设置错误

**错误信息：**
```
Error: Input required and not supplied: NETLIFY_AUTH_TOKEN
```

**解决方案：**
1. 获取Netlify访问令牌：
   - 登录 [Netlify](https://app.netlify.com)
   - 进入 User Settings → Applications
   - 点击 "New access token"
   - 复制生成的token

2. 获取Netlify站点ID：
   - 在Netlify中选择你的站点
   - 进入 Site Settings → General
   - 找到 "Site details" 中的 "Site ID"

3. 在GitHub中设置Secrets：
   - GitHub仓库 → Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - 添加 `NETLIFY_AUTH_TOKEN` 和 `NETLIFY_SITE_ID`

### 问题2: 工作流文件语法错误

**错误信息：**
```
Invalid workflow file
```

**解决方案：**
检查 `.github/workflows/` 目录下的YAML文件语法是否正确。

### 问题3: Netlify站点未创建

**错误信息：**
```
Site not found
```

**解决方案：**
1. 登录Netlify
2. 创建新站点
3. 获取正确的Site ID
4. 更新GitHub Secrets

### 问题4: 权限问题

**错误信息：**
```
Authentication failed
```

**解决方案：**
1. 确认Netlify token有效且未过期
2. 检查token权限是否足够
3. 重新生成token并更新GitHub Secrets

## 🔍 调试步骤

### 步骤1: 检查GitHub Actions日志

1. 进入GitHub仓库 → Actions
2. 点击失败的工作流
3. 查看详细错误日志
4. 找到具体的错误信息

### 步骤2: 检查Netlify部署日志

1. 登录Netlify
2. 进入你的站点
3. 点击 "Deploys" 标签
4. 查看部署历史和错误信息

### 步骤3: 本地测试

```bash
# 确保本地代码正常工作
python3 -m http.server 8000

# 检查文件结构
ls -la

# 确认工作流文件存在
ls -la .github/workflows/
```

## 🛠️ 手动触发部署

如果自动部署失败，可以手动触发：

### 方法1: 通过GitHub Actions

1. 进入GitHub仓库 → Actions
2. 选择工作流
3. 点击 "Run workflow"
4. 选择分支并运行

### 方法2: 重新推送代码

```bash
# 创建一个空提交来触发部署
git commit --allow-empty -m "🚀 手动触发部署"
git push origin main
```

## 📊 验证部署成功

### 检查项目：

1. **GitHub Actions状态** - 应该显示绿色✅
2. **Netlify部署状态** - 应该显示 "Published"
3. **网站访问** - 能够正常访问你的Netlify URL
4. **功能测试** - 所有功能正常工作

## 🆘 如果仍然无法解决

### 收集信息：

1. **GitHub Actions错误日志**
2. **Netlify部署错误日志**  
3. **当前的GitHub Secrets设置**
4. **Netlify站点配置**

### 常用命令：

```bash
# 检查git状态
git status

# 查看最近提交
git log --oneline -5

# 检查远程仓库
git remote -v

# 强制推送（谨慎使用）
git push origin main --force
```

## 🔗 有用链接

- [Netlify文档](https://docs.netlify.com/)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [nwtgck/actions-netlify](https://github.com/nwtgck/actions-netlify)
- [Netlify部署状态](https://www.netlifystatus.com/)

---

💡 **提示：** 大部分部署问题都是由于Secrets配置错误导致的。请首先检查GitHub Secrets是否正确设置。
