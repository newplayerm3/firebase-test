#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Firebase谷歌登录Flask项目启动脚本
"""

import os
import sys
import subprocess

def check_dependencies():
    """检查项目依赖"""
    print("🔍 检查项目依赖...")
    
    try:
        import flask
        print("✅ Flask 已安装")
    except ImportError:
        print("❌ Flask 未安装，正在安装...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    try:
        import firebase_admin
        print("✅ Firebase Admin SDK 已安装")
    except ImportError:
        print("❌ Firebase Admin SDK 未安装，正在安装...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "firebase-admin"])

def check_config_files():
    """检查配置文件"""
    print("\n🔍 检查配置文件...")
    
    # 检查Firebase服务账户密钥
    if not os.path.exists("firebase-service-account.json"):
        print("❌ 缺少 firebase-service-account.json 文件")
        print("请按照以下步骤获取：")
        print("1. 访问 Firebase控制台: https://console.firebase.google.com/")
        print("2. 选择项目: test-base-a7c4b")
        print("3. 进入项目设置 → 服务账户")
        print("4. 点击'生成新的私钥'")
        print("5. 下载JSON文件并重命名为 firebase-service-account.json")
        print("6. 将文件放在项目根目录")
        return False
    
    print("✅ Firebase服务账户密钥文件存在")
    
    # 检查环境变量文件
    if not os.path.exists(".env"):
        print("⚠️  缺少 .env 文件，正在创建...")
        try:
            with open("env_example.txt", "r", encoding="utf-8") as f:
                env_content = f.read()
            
            # 生成随机密钥
            import secrets
            random_key = secrets.token_hex(32)
            env_content = env_content.replace("your-super-secret-key-here", random_key)
            
            with open(".env", "w", encoding="utf-8") as f:
                f.write(env_content)
            
            print("✅ .env 文件已创建")
        except Exception as e:
            print(f"❌ 创建 .env 文件失败: {e}")
            return False
    else:
        print("✅ .env 文件存在")
    
    return True

def start_app():
    """启动Flask应用"""
    print("\n🚀 启动Flask应用...")
    
    try:
        # 设置环境变量
        os.environ['FLASK_ENV'] = 'development'
        os.environ['FLASK_DEBUG'] = '1'
        
        # 启动应用
        subprocess.run([sys.executable, "app.py"])
        
    except KeyboardInterrupt:
        print("\n\n👋 应用已停止")
    except Exception as e:
        print(f"❌ 启动应用失败: {e}")

def main():
    """主函数"""
    print("🔥 Firebase谷歌登录Flask项目")
    print("=" * 50)
    
    # 检查依赖
    check_dependencies()
    
    # 检查配置文件
    if not check_config_files():
        print("\n❌ 配置文件检查失败，请按照提示完成配置")
        return
    
    print("\n✅ 所有检查通过！")
    
    # 启动应用
    start_app()

if __name__ == "__main__":
    main()

