# 智能升学助手 - 静态版本部署脚本 (PowerShell)
# 设置控制台编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   智能升学助手 - 静态版本部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查文件结构
Write-Host "📁 检查文件结构..." -ForegroundColor Yellow

$requiredFiles = @(
    "index.html",
    "assets\css\main.css",
    "assets\js\main.js",
    "netlify.toml"
)

$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ 错误：以下文件缺失：" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host ""
    Read-Host "按回车键退出"
    exit 1
}

Write-Host "✅ 文件结构检查完成" -ForegroundColor Green
Write-Host ""

# 显示部署信息
Write-Host "🚀 准备部署到 Netlify..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 部署步骤：" -ForegroundColor Cyan
Write-Host "1. 访问 https://netlify.com" -ForegroundColor White
Write-Host "2. 注册/登录账号" -ForegroundColor White
Write-Host "3. 点击 'Add new site'" -ForegroundColor White
Write-Host "4. 选择 'Deploy manually'" -ForegroundColor White
Write-Host "5. 将整个 static-version 文件夹拖拽到部署区域" -ForegroundColor White
Write-Host "6. 等待部署完成" -ForegroundColor White
Write-Host ""

# 显示当前目录信息
Write-Host "📁 当前目录：$PWD" -ForegroundColor Yellow

# 统计文件数量
$fileCount = (Get-ChildItem -Recurse | Measure-Object).Count
Write-Host "📊 总文件数：$fileCount" -ForegroundColor Yellow

# 显示目录结构
Write-Host ""
Write-Host "📁 目录结构：" -ForegroundColor Cyan
Get-ChildItem -Recurse | ForEach-Object {
    $indent = "  " * ($_.FullName.Split('\').Count - $PWD.Path.Split('\').Count)
    $icon = if ($_.PSIsContainer) { "📁" } else { "📄" }
    Write-Host "$indent$icon $($_.Name)" -ForegroundColor White
}

Write-Host ""
Write-Host "🎯 部署准备完成！" -ForegroundColor Green
Write-Host ""
Write-Host "💡 提示：" -ForegroundColor Cyan
Write-Host "- 确保所有文件都已准备好" -ForegroundColor White
Write-Host "- 检查图片资源是否完整" -ForegroundColor White
Write-Host "- 测试本地功能是否正常" -ForegroundColor White
Write-Host ""

# 询问是否打开Netlify网站
$openNetlify = Read-Host "是否打开 Netlify 网站？(y/n)"
if ($openNetlify -eq 'y' -or $openNetlify -eq 'Y') {
    Write-Host "🌐 正在打开 Netlify 网站..." -ForegroundColor Green
    Start-Process "https://netlify.com"
}

Write-Host ""
Write-Host "🎉 部署脚本执行完成！" -ForegroundColor Green
Write-Host "📖 详细部署说明请查看 DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
Read-Host "按回车键退出"
