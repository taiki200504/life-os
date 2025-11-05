"""
Vercel Serverless Functions用Flaskアプリ
NotionをメインDBとして使用（SQLite不要）
"""
import os
import sys

# バックエンドのパスを追加
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'taiki-life-os-backend'))

from flask import Flask, jsonify
from flask_cors import CORS
from src.routes.notion_routes import notion_bp
from src.routes.tasks_routes import tasks_bp
from src.routes.daily_update_routes import daily_update_bp
from src.routes.notion_unified_routes import notion_unified_bp
from src.services.notion_unified_service import NotionUnifiedService

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

# Notion接続状況確認API
@app.route('/api/notion/config', methods=['GET'])
def get_notion_config():
    """Notion接続状況を取得"""
    try:
        api_key = os.getenv('NOTION_API_KEY')
        db_taiki_task = os.getenv('NOTION_DB_TAIKI_TASK')
        db_weekly_goals = os.getenv('NOTION_DB_WEEKLY_GOALS')
        db_life_plan = os.getenv('NOTION_DB_LIFE_PLAN')
        db_life_rules = os.getenv('NOTION_DB_LIFE_RULES')
        
        configured = bool(api_key)
        
        # 接続テスト
        connection_test = False
        error_message = None
        if configured:
            try:
                service = NotionUnifiedService(api_key)
                connection_test = service.test_connection()
                if not connection_test:
                    error_message = "Notion APIへの接続に失敗しました"
            except Exception as e:
                error_message = str(e)
        
        return jsonify({
            'configured': configured and connection_test,
            'api_key_set': bool(api_key),
            'connection_test': connection_test,
            'error': error_message,
            'database_ids': {
                'taiki_task': bool(db_taiki_task),
                'weekly_goals': bool(db_weekly_goals),
                'life_plan': bool(db_life_plan),
                'life_rules': bool(db_life_rules)
            }
        })
    except Exception as e:
        return jsonify({
            'configured': False,
            'error': str(e)
        }), 500

# Vercel Functions用のハンドラー
# Mangumを使ってFlaskアプリをASGI/WSGIアダプターとして使用
from mangum import Mangum

# Vercel Functionsはhandler関数を検出する
handler = Mangum(app, lifespan="off")

