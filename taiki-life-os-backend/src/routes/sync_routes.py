from flask import Blueprint, request, jsonify
from src.services.notion_sync_service import NotionSyncService
import json

sync_bp = Blueprint('sync', __name__)
notion_sync = NotionSyncService()

@sync_bp.route('/sync/setup', methods=['POST'])
def setup_notion_databases():
    """Notion データベースをセットアップ"""
    try:
        # 接続テスト
        if not notion_sync.test_connection():
            return jsonify({
                'success': False,
                'message': 'Notion API接続に失敗しました'
            }), 400
        
        # データベース作成
        databases = notion_sync.setup_life_os_databases()
        
        if databases:
            return jsonify({
                'success': True,
                'message': 'Notionデータベースが正常にセットアップされました',
                'databases': databases
            })
        else:
            return jsonify({
                'success': False,
                'message': 'データベースの作成に失敗しました'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500

@sync_bp.route('/sync/daily-tasks', methods=['POST'])
def sync_daily_tasks():
    """日次タスクをNotionに同期"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        
        success = notion_sync.sync_daily_tasks(tasks)
        
        if success:
            return jsonify({
                'success': True,
                'message': '日次タスクが正常に同期されました'
            })
        else:
            return jsonify({
                'success': False,
                'message': '日次タスクの同期に失敗しました'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500

@sync_bp.route('/sync/weekly-goals', methods=['POST'])
def sync_weekly_goals():
    """週次目標をNotionに同期"""
    try:
        data = request.get_json()
        goals = data.get('goals', [])
        
        success = notion_sync.sync_weekly_goals(goals)
        
        if success:
            return jsonify({
                'success': True,
                'message': '週次目標が正常に同期されました'
            })
        else:
            return jsonify({
                'success': False,
                'message': '週次目標の同期に失敗しました'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500

@sync_bp.route('/sync/all', methods=['POST'])
def sync_all_data():
    """すべてのデータをNotionに同期"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        goals = data.get('goals', [])
        
        # 日次タスクを同期
        tasks_success = notion_sync.sync_daily_tasks(tasks)
        
        # 週次目標を同期
        goals_success = notion_sync.sync_weekly_goals(goals)
        
        if tasks_success and goals_success:
            return jsonify({
                'success': True,
                'message': 'すべてのデータが正常に同期されました'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'データの同期に一部失敗しました',
                'details': {
                    'tasks_synced': tasks_success,
                    'goals_synced': goals_success
                }
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500

@sync_bp.route('/sync/status', methods=['GET'])
def get_sync_status():
    """同期状態を確認"""
    try:
        connection_ok = notion_sync.test_connection()
        
        return jsonify({
            'success': True,
            'connection': connection_ok,
            'databases': notion_sync.database_ids,
            'message': 'Notion接続正常' if connection_ok else 'Notion接続エラー'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500

@sync_bp.route('/sync/auto', methods=['POST'])
def auto_sync():
    """自動同期（タスク完了時などに呼び出し）"""
    try:
        data = request.get_json()
        sync_type = data.get('type', 'all')  # 'tasks', 'goals', 'all'
        
        if sync_type == 'tasks':
            tasks = data.get('tasks', [])
            success = notion_sync.sync_daily_tasks(tasks)
        elif sync_type == 'goals':
            goals = data.get('goals', [])
            success = notion_sync.sync_weekly_goals(goals)
        else:  # all
            tasks = data.get('tasks', [])
            goals = data.get('goals', [])
            tasks_success = notion_sync.sync_daily_tasks(tasks)
            goals_success = notion_sync.sync_weekly_goals(goals)
            success = tasks_success and goals_success
        
        return jsonify({
            'success': success,
            'message': '自動同期完了' if success else '自動同期に失敗'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'自動同期エラー: {str(e)}'
        }), 500

