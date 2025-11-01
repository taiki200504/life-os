"""
Automation Routes - 自動化処理のAPIエンドポイント
"""
from flask import Blueprint, jsonify
from src.services.automation_service import automation_service
import schedule

automation_bp = Blueprint('automation', __name__)

@automation_bp.route('/trigger/sync', methods=['POST'])
def trigger_sync():
    """手動で同期をトリガー"""
    try:
        results = automation_service.sync_with_notion()
        return jsonify({
            'success': True,
            'results': results
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@automation_bp.route('/trigger/daily', methods=['POST'])
def trigger_daily():
    """手動で日次処理をトリガー"""
    try:
        results = automation_service.daily_tasks()
        return jsonify({
            'success': True,
            'results': results
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@automation_bp.route('/trigger/next-day', methods=['POST'])
def trigger_next_day():
    """手動で翌日ブロック生成をトリガー"""
    try:
        results = automation_service.generate_next_day_block()
        return jsonify({
            'success': True,
            'results': results
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@automation_bp.route('/status', methods=['GET'])
def automation_status():
    """自動化の状態を取得"""
    try:
        return jsonify({
            'success': True,
            'is_running': automation_service.is_running,
            'scheduler_jobs': len(schedule.get_jobs()) if automation_service.is_running else 0
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
