import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.sessions import sessions_bp
from src.routes.reviews import reviews_bp
from src.routes.tasks import tasks_bp
from src.routes.kpi import kpi_bp
from src.routes.notion_sync import notion_sync_bp
from src.routes.automation import automation_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'taiki-life-os-v2-secret-key-2025'

# CORS設定
CORS(app, origins="*")

# APIルートの登録
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(sessions_bp, url_prefix='/api')
app.register_blueprint(reviews_bp, url_prefix='/api')
app.register_blueprint(tasks_bp, url_prefix='/api')
app.register_blueprint(kpi_bp, url_prefix='/api')
app.register_blueprint(notion_sync_bp, url_prefix='/api/notion')
app.register_blueprint(automation_bp, url_prefix='/api/automation')

# データベース設定
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# データベース初期化
with app.app_context():
    db.create_all()

# 自動化サービスを開始
from src.services.automation_service import automation_service
automation_service.start_scheduler()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/health', methods=['GET'])
def health_check():
    """ヘルスチェックエンドポイント"""
    return {'status': 'healthy', 'version': '2.0.0'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
