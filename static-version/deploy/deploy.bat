@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   智能升学助手 - 静态版本部署脚本
echo ========================================
echo.

echo 📁 检查文件结构...
if not exist "index.html" (
    echo ❌ 错误：找不到 index.html 文件
    pause
    exit /b 1
)

if not exist "assets\css\main.css" (
    echo ❌ 错误：找不到 CSS 文件
    pause
    exit /b 1
)

if not exist "assets\js\main.js" (
    echo ❌ 错误：找不到 JavaScript 文件
    pause
    exit /b 1
)

if not exist "netlify.toml" (
    echo ❌ 错误：找不到 Netlify 配置文件
    pause
    exit /b 1
)

echo ✅ 文件结构检查完成
echo.

echo 🚀 准备部署到 Netlify...
echo.
echo 📋 部署步骤：
echo 1. 访问 https://netlify.com
echo 2. 注册/登录账号
echo 3. 点击 "Add new site"
echo 4. 选择 "Deploy manually"
echo 5. 将整个 static-version 文件夹拖拽到部署区域
echo 6. 等待部署完成
echo.

echo 📁 当前目录：%CD%
echo 📊 文件统计：
dir /s /b | find /c /v "" > temp_count.txt
set /p file_count=<temp_count.txt
del temp_count.txt
echo 总文件数：%file_count%
echo.

echo 🎯 部署准备完成！
echo.
echo 💡 提示：
echo - 确保所有文件都已准备好
echo - 检查图片资源是否完整
echo - 测试本地功能是否正常
echo.

echo 按任意键打开 Netlify 网站...
pause >nul
start https://netlify.com

echo.
echo 🎉 部署脚本执行完成！
echo 📖 详细部署说明请查看 DEPLOYMENT.md
echo.
pause
