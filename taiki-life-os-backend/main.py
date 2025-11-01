import os
import sys
# DON\'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.notion_routes import notion_bp
from src.routes.tasks_routes import tasks_bp
from src.routes.email_routes import email_bp
from src.routes.sync_routes import sync_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# CORS設定
CORS(app, origins="*")

# ブループリントの登録
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(notion_bp, url_prefix='/api/notion')
app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
app.register_blueprint(email_bp, url_prefix='/api/email')
app.register_blueprint(sync_bp, url_prefix='/api')

# データベース設定
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()
    
    # 環境変数からNotion設定を自動で設定
    from src.models.notion_models import NotionConfig
    if not NotionConfig.query.first():
        # 環境変数から取得（必須）
        api_key = os.getenv('NOTION_API_KEY')
        parent_page_id = os.getenv('NOTION_PARENT_PAGE_ID')
        
        if api_key:
            config = NotionConfig(
                api_key=api_key,
                daily_tasks_db_id=None,  # 必要に応じて後で設定
                weekly_goals_db_id=None,
                metrics_db_id=None,
                life_plan_db_id=None,
                current_self_db_id=None
            )
            db.session.add(config)
            db.session.commit()
            print("Notion設定を自動設定しました")
        else:
            print("警告: NOTION_API_KEY環境変数が設定されていません")

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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)