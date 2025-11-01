"""
Notion Sync Routes - Notion連携のAPIエンドポイント
"""
from flask import Blueprint, jsonify, request
from src.models.user import db, Task, TaskStatus
from src.services.notion_sync_service import NotionSyncService
from datetime import datetime
import os

notion_sync_bp = Blueprint('notion_sync', __name__)
notion_service = NotionSyncService()

@notion_sync_bp.route('/sync', methods=['POST'])
def sync_all():
    """すべてのデータを双方向同期"""
    try:
        results = notion_service.sync_all()
        return jsonify({
            'success': True,
            'results': results
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@notion_sync_bp.route('/sync/from-notion', methods=['POST'])
def sync_from_notion():
    """Notionからデータを取得"""
    try:
        results = notion_service.sync_tasks_from_notion()
        return jsonify({
            'success': True,
            'results': results
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@notion_sync_bp.route('/sync/to-notion', methods=['POST'])
def sync_to_notion():
    """Notionにデータを送信"""
    try:
        results = notion_service.sync_tasks_to_notion()
        return jsonify({
            'success': True,
            'results': results
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@notion_sync_bp.route('/sync/status', methods=['GET'])
def sync_status():
    """同期ステータスを取得"""
    try:
        last_sync = notion_service._get_last_sync_time()
        return jsonify({
            'success': True,
            'last_sync': last_sync,
            'notion_connected': bool(os.getenv('NOTION_TOKEN')),
            'notion_token_set': bool(os.getenv('NOTION_TOKEN'))
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
