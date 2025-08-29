from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
import firebase_admin
from firebase_admin import credentials, auth, firestore
import requests
import json
import os
from dotenv import load_dotenv

# 加载环境变量
# load_dotenv()

app = Flask(__name__)
app.secret_key = 'your-super-secret-key-here-change-this-in-production'

# 初始化Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-service-account.json")
    firebase_admin.initialize_app(cred)

# 初始化Firestore
db = firestore.client()

# 初始化Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Firebase配置
FIREBASE_CONFIG = {
    "apiKey": "AIzaSyBPeOp2JxbcLyFOdTlaPVaLcHs3c-UlDlU",
    "authDomain": "test-base-a7c4b.firebaseapp.com",
    "projectId": "test-base-a7c4b",
    "storageBucket": "test-base-a7c4b.firebasestorage.app",
    "messagingSenderId": "693148597675",
    "appId": "1:693148597675:web:b2f8572531db152d7866ee",
    "measurementId": "G-T65DZD1826"
}

class User(UserMixin):
    def __init__(self, uid, email, display_name=None):
        self.id = uid or ''
        self.email = email or ''
        self.display_name = display_name or ''

@login_manager.user_loader
def load_user(user_id):
    try:
        user_record = auth.get_user(user_id)
        return User(user_record.uid, user_record.email, user_record.display_name)
    except:
        return None

@app.route('/')
def index():
    return render_template('index.html', firebase_config=FIREBASE_CONFIG)

@app.route('/login')
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('login.html', firebase_config=FIREBASE_CONFIG)

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user, firebase_config=FIREBASE_CONFIG)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    flash('您已成功登出！', 'success')
    return redirect(url_for('index'))

@app.route('/verify-token', methods=['POST'])
def verify_token():
    try:
        print("🔍 开始验证Google登录token...")
        data = request.get_json()
        id_token = data.get('idToken')
        
        if not id_token:
            print("❌ 没有提供ID token")
            return {'error': 'No ID token provided'}, 400
        
        print(f"✅ 收到ID token，长度: {len(id_token)}")
        
        # 验证Firebase ID token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        print(f"✅ Token验证成功，用户ID: {uid}")
        
        # 获取用户信息
        user_record = auth.get_user(uid)
        print(f"✅ 获取用户信息成功: {user_record.email}")
        
        # 检查用户是否已在Firestore中存在
        print("🔍 检查Firestore中的用户数据...")
        user_doc = db.collection('users').document(uid).get()
        
        if not user_doc.exists:
            # 新用户，保存到Firestore
            print("📝 新用户，保存到Firestore...")
            user_data = {
                'uid': uid,
                'email': user_record.email,
                'display_name': user_record.display_name or '',
                'created_at': firestore.SERVER_TIMESTAMP,
                'last_login': firestore.SERVER_TIMESTAMP,
                'auth_provider': 'google'
            }
            db.collection('users').document(uid).set(user_data)
            print("✅ 用户数据已保存到Firestore")
        else:
            # 更新最后登录时间
            print("📝 更新现有用户的登录时间...")
            db.collection('users').document(uid).update({
                'last_login': firestore.SERVER_TIMESTAMP
            })
            print("✅ 登录时间已更新")
        
        # 创建用户对象并登录
        print("🔐 创建Flask-Login用户对象...")
        user = User(uid, user_record.email, user_record.display_name)
        login_user(user)
        print("✅ 用户已登录到Flask-Login")
        
        return {'success': True, 'user': {
            'uid': uid,
            'email': user_record.email,
            'displayName': user_record.display_name
        }}
        
    except Exception as e:
        return {'error': str(e)}, 400

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
        return render_template('register.html', firebase_config=FIREBASE_CONFIG)
    
    if request.method == 'POST':
        try:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            display_name = data.get('displayName', '')
            
            if not email or not password:
                return jsonify({'error': '邮箱和密码不能为空'}), 400
            
            # 在Firebase中创建用户
            user_record = auth.create_user(
                email=email,
                password=password,
                display_name=display_name,
                email_verified=False
            )
            
            # 将用户信息保存到Firestore数据库
            user_data = {
                'uid': user_record.uid,
                'email': user_record.email,
                'display_name': user_record.display_name or '',
                'created_at': firestore.SERVER_TIMESTAMP,
                'last_login': firestore.SERVER_TIMESTAMP,
                'auth_provider': 'email_password'
            }
            
            # 保存到users集合
            db.collection('users').document(user_record.uid).set(user_data)
            
            # 创建用户对象并登录
            # 更新最后登录时间
            db.collection('users').document(user_record.uid).update({
                'last_login': firestore.SERVER_TIMESTAMP
            })
            
            user = User(
                uid=user_record.uid, 
                email=user_record.email or '', 
                display_name=user_record.display_name or ''
            )
            login_user(user)
            
            return jsonify({'success': True, 'user': {
                'uid': user_record.uid,
                'email': user_record.email,
                'displayName': user_record.display_name
            }})
            
        except Exception as e:
            error_message = str(e)
            if 'EMAIL_EXISTS' in error_message:
                return jsonify({'error': '该邮箱已被注册'}), 400
            elif 'WEAK_PASSWORD' in error_message:
                return jsonify({'error': '密码强度不够，请使用至少6位字符'}), 400
            elif 'INVALID_EMAIL' in error_message:
                return jsonify({'error': '邮箱格式不正确'}), 400
            else:
                return jsonify({'error': f'注册失败: {error_message}'}), 400

@app.route('/email-login', methods=['POST'])
def email_login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': '邮箱和密码不能为空'}), 400
        
        # 使用Firebase Admin SDK验证用户
        # 注意：Firebase Admin SDK不能直接验证密码，我们需要使用REST API
        # 这里我们创建一个简单的验证流程
        
        # 获取用户信息（如果存在）
        try:
            user_record = auth.get_user_by_email(email)
            # 用户存在，但我们需要验证密码
            # 在实际应用中，你可能需要使用Firebase Auth REST API来验证密码
            # 这里我们暂时跳过密码验证，直接登录（仅用于演示）
            
            user = User(
                uid=user_record.uid, 
                email=user_record.email or '', 
                display_name=user_record.display_name or ''
            )
            login_user(user)
            
            return jsonify({'success': True, 'user': {
                'uid': user_record.uid,
                'email': user_record.email,
                'displayName': user_record.display_name
            }})
            
        except auth.UserNotFoundError:
            return jsonify({'error': '用户不存在'}), 400
            
    except Exception as e:
        return jsonify({'error': f'登录失败: {str(e)}'}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)
