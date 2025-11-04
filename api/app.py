"""
Vercel Serverless Functions用Flaskアプリ
NotionをメインDBとして使用（SQLite不要）
"""
import os
import sys

# バックエンドのパスを追加
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'taiki-life-os-backend'))

from flask import Flask
from flask_cors import CORS
from src.routes.notion_routes import notion_bp
from src.routes.tasks_routes import tasks_bp
from src.routes.daily_update_routes import daily_update_bp
from src.routes.notion_unified_routes import notion_unified_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# CORS設定
CORS(app, origins="*")

# ブループリントの登録
app.register_blueprint(notion_bp, url_prefix='/api/notion')
app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
app.register_blueprint(daily_update_bp, url_prefix='/api')
app.register_blueprint(notion_unified_bp, url_prefix='')

# ヘルスチェック
@app.route('/api/health', methods=['GET'])
def health():
    """ヘルスチェックエンドポイント"""
    return {'status': 'ok', 'service': 'taiki-life-os-api'}, 200

# Vercel Functions用のハンドラー
# Mangumを使ってFlaskアプリをASGI/WSGIアダプターとして使用
from mangum import Mangum

# Vercel Functionsはhandler関数を検出する
handler = Mangum(app, lifespan="off")

