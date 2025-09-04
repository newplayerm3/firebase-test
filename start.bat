@echo off
echo 正在启动 Firebase 谷歌登录 Web 应用...
echo.
echo 项目将在以下地址运行:
echo http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器
echo.
python -m http.server 3000
pause
