#!/bin/bash

# Firebase 连接测试脚本
# Smart College Advisor - Firebase Connection Test

echo "🔥 Firebase 连接测试脚本"
echo "=================================="

# 检查当前目录
if [ ! -f "index.html" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "📋 项目信息:"
echo "  项目ID: smart-college-cf2b1"
echo "  配置文件: config.js"
echo "  测试页面: firebase-connection-test.html"

# 检查配置文件
if [ -f "config.js" ]; then
    echo "✅ 配置文件存在"
    
    # 检查Firebase配置
    if grep -q "smart-college-cf2b1" config.js; then
        echo "✅ Firebase项目ID配置正确"
    else
        echo "⚠️ Firebase项目ID可能有问题"
    fi
    
    if grep -q "firebasestorage.app" config.js; then
        echo "✅ 存储桶域名已更新"
    else
        echo "⚠️ 存储桶域名可能需要更新"
    fi
else
    echo "❌ 配置文件不存在"
    exit 1
fi

echo ""
echo "🚀 启动选项:"
echo "1. 打开Firebase连接测试页面"
echo "2. 打开主网站测试"
echo "3. 启动本地服务器"
echo "4. 查看Firebase配置"
echo "5. 打开Firebase控制台"

read -p "请选择 (1-5): " choice

case $choice in
    1)
        echo "📱 打开Firebase连接测试页面..."
        open firebase-connection-test.html
        ;;
    2)
        echo "🌐 打开主网站..."
        open index.html
        ;;
    3)
        echo "🚀 启动本地服务器..."
        echo "服务器将在 http://localhost:8000 启动"
        python3 -m http.server 8000
        ;;
    4)
        echo "⚙️ Firebase配置信息:"
        echo "=================================="
        grep -A 10 "firebase.*{" config.js | head -15
        ;;
    5)
        echo "🔗 打开Firebase控制台..."
        open "https://console.firebase.google.com/project/smart-college-cf2b1"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "📚 有用的链接:"
echo "  Firebase控制台: https://console.firebase.google.com/project/smart-college-cf2b1"
echo "  配置指南: FIREBASE_SETUP_GUIDE.md"
echo "  故障排除: FIREBASE_TROUBLESHOOTING.md"
echo ""
echo "✅ 脚本执行完成"
