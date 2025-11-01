from flask import Blueprint, jsonify
from datetime import datetime
import os
from ..services.notion_service import NotionService

notion_status_bp = Blueprint('notion_status', __name__)

@notion_status_bp.route('/api/notion/status', methods=['GET'])
def get_notion_status():
    """Notionとの連携状況を取得"""
    try:
        notion_service = NotionService()
        
        # Notion APIキーの設定状況を確認
        api_key = os.getenv('NOTION_API_KEY')
        page_id = os.getenv('NOTION_PAGE_ID')
        
        if not api_key or not page_id:
            return jsonify({
                'connected': False,
                'error': 'Notion APIキーまたはページIDが設定されていません',
                'last_sync': None,
                'sync_count': 0
            })
        
        # 接続テスト
        try:
            # Notionページへの接続テスト
            response = notion_service.get_page_info(page_id)
            connected = True
            connection_error = None
        except Exception as e:
            connected = False
            connection_error = str(e)
        
        # 同期履歴の取得（簡易版）
        # 実際の実装では、データベースから同期履歴を取得
        last_sync = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        sync_count = 1  # 仮の値
        
        return jsonify({
            'connected': connected,
            'connection_error': connection_error,
            'last_sync': last_sync,
            'sync_count': sync_count,
            'api_key_configured': bool(api_key),
            'page_id_configured': bool(page_id)
        })
        
    except Exception as e:
        return jsonify({
            'connected': False,
            'error': f'ステータス取得エラー: {str(e)}',
            'last_sync': None,
            'sync_count': 0
        }), 500

@notion_status_bp.route('/api/notion/sync-now', methods=['POST'])
def sync_now():
    """手動でNotionとの同期を実行"""
    try:
        notion_service = NotionService()
        
        # 手動同期の実行
        result = notion_service.sync_tasks()
        
        return jsonify({
            'success': True,
            'message': 'Notionとの同期が完了しました',
            'sync_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'synced_tasks': result.get('synced_tasks', 0) if result else 0
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'同期エラー: {str(e)}'
        }), 500

@notion_status_bp.route('/api/notion/recent-activity', methods=['GET'])
def get_recent_activity():
    """最近のNotion連携アクティビティを取得"""
    try:
        # 実際の実装では、データベースから最近のアクティビティを取得
        activities = [
            {
                'type': 'sync',
                'message': 'タスクをNotionと同期しました',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'status': 'success'
            },
            {
                'type': 'update',
                'message': '日次目標を更新しました',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'status': 'success'
            }
        ]
        
        return jsonify({
            'activities': activities
        })
        
    except Exception as e:
        return jsonify({
            'activities': [],
            'error': f'アクティビティ取得エラー: {str(e)}'
        }), 500

