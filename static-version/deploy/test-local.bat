@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   智能升学助手 - 本地测试脚本
echo ========================================
echo.

echo 🔍 检查本地环境...

REM 检查Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python 已安装
    set PYTHON_CMD=python
    goto :start_server
)

REM 检查Python3
python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python3 已安装
    set PYTHON_CMD=python3
    goto :start_server
)

REM 检查Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js 已安装
    set NODE_CMD=node
    goto :start_node_server
)

REM 检查PHP
php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PHP 已安装
    set PHP_CMD=php
    goto :start_php_server
)

echo ❌ 未找到可用的Web服务器
echo.
echo 💡 请安装以下任一环境：
echo - Python (推荐)
echo - Node.js
echo - PHP
echo.
echo 或者手动启动服务器
pause
exit /b 1

:start_server
echo.
echo 🚀 启动Python HTTP服务器...
echo 📍 服务器地址：http://localhost:8000
echo 💡 按 Ctrl+C 停止服务器
echo.
%PYTHON_CMD% -m http.server 8000
goto :end

:start_node_server
echo.
echo 🚀 启动Node.js服务器...
echo 📍 服务器地址：http://localhost:8000
echo 💡 按 Ctrl+C 停止服务器
echo.
%NODE_CMD% -e "require('http').createServer((req, res) => { require('fs').readFile('.' + (req.url === '/' ? '/index.html' : req.url), (err, data) => { res.writeHead(200, {'Content-Type': req.url.endsWith('.css') ? 'text/css' : req.url.endsWith('.js') ? 'application/javascript' : 'text/html'}); res.end(data || 'File not found'); }); }).listen(8000, () => console.log('Server running at http://localhost:8000/'));"
goto :end

:start_php_server
echo.
echo 🚀 启动PHP服务器...
echo 📍 服务器地址：http://localhost:8000
echo 💡 按 Ctrl+C 停止服务器
echo.
%PHP_CMD% -S localhost:8000
goto :end

:end
echo.
echo 🎉 测试完成！
pause
