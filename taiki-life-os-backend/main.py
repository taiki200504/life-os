import os
import sys
# DON\'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.routes.notion_routes import notion_bp
from src.routes.tasks_routes import tasks_bp
from src.routes.daily_update_routes import daily_update_bp
from src.routes.notion_unified_routes import notion_unified_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# CORS設定
CORS(app, origins="*")

# ブループリントの登録
app.register_blueprint(notion_bp, url_prefix='/api/notion')
app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
app.register_blueprint(daily_update_bp, url_prefix='/api')
app.register_blueprint(notion_unified_bp, url_prefix='')

# Notion APIキーの確認（SQLiteは不要、Notion中心）
api_key = os.getenv('NOTION_API_KEY')
if not api_key:
    print("警告: NOTION_API_KEY環境変数が設定されていません")
else:
    print("Notion APIキーが設定されています")

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