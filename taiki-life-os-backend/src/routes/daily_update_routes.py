"""
Daily Update Routes for Taiki Life OS
日次更新とシステム状態管理のAPIエンドポイント
"""

from flask import Blueprint, jsonify, request
from ..services.daily_update_service import DailyUpdateService
import logging

logger = logging.getLogger(__name__)

daily_update_bp = Blueprint('daily_update', __name__)
daily_update_service = DailyUpdateService()

@daily_update_bp.route('/api/system/status', methods=['GET'])
def get_system_status():
    """システムの状態を取得"""
    try:
        status = daily_update_service.get_system_status()
        return jsonify(status), 200
    except Exception as e:
        logger.error(f"Error getting system status: {e}")
        return jsonify({"error": str(e)}), 500

@daily_update_bp.route('/api/system/update', methods=['POST'])
def perform_daily_update():
    """日次更新を手動実行"""
    try:
        result = daily_update_service.perform_daily_update()
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error performing daily update: {e}")
        return jsonify({"error": str(e)}), 500

@daily_update_bp.route('/api/system/check-update', methods=['GET'])
def check_update_needed():
    """更新が必要かどうかをチェック"""
    try:
        needs_update = daily_update_service.should_update_today()
        return jsonify({
            "needs_update": needs_update,
            "current_time": daily_update_service.get_system_status()["current_time"]
        }), 200
    except Exception as e:
        logger.error(f"Error checking update: {e}")
        return jsonify({"error": str(e)}), 500

@daily_update_bp.route('/api/system/force-update', methods=['POST'])
def force_daily_update():
    """強制的に日次更新を実行（開発・テスト用）"""
    try:
        # 強制更新フラグを設定
        result = daily_update_service.perform_daily_update()
        result["forced"] = True
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error forcing daily update: {e}")
        return jsonify({"error": str(e)}), 500

@daily_update_bp.route('/api/system/auto-update', methods=['GET'])
def auto_update_check():
    """自動更新チェック（フロントエンドから定期的に呼び出される）"""
    try:
        # 更新が必要かチェック
        if daily_update_service.should_update_today():
            # 自動更新を実行
            result = daily_update_service.perform_daily_update()
            result["auto_updated"] = True
            return jsonify(result), 200
        else:
            # 更新不要
            return jsonify({
                "auto_updated": False,
                "message": "No update needed today",
                "last_update": daily_update_service.get_system_status()["last_update"]
            }), 200
    except Exception as e:
        logger.error(f"Error in auto update check: {e}")
        return jsonify({"error": str(e)}), 500

@daily_update_bp.route('/api/tasks/daily', methods=['GET'])
def get_daily_tasks():
    """今日のタスクを取得"""
    try:
        # 自動更新チェックを先に実行
        if daily_update_service.should_update_today():
            daily_update_service.perform_daily_update()
        
        # 日次タスクデータを取得
        daily_data = daily_update_service.reset_daily_tasks()
        return jsonify(daily_data), 200
    except Exception as e:
        logger.error(f"Error getting daily tasks: {e}")
        return jsonify({"error": str(e)}), 500

@daily_update_bp.route('/api/goals/weekly', methods=['GET'])
def get_weekly_goals():
    """週次目標を取得"""
    try:
        goals = daily_update_service.get_weekly_goals()
        return jsonify({"goals": goals}), 200
    except Exception as e:
        logger.error(f"Error getting weekly goals: {e}")
        return jsonify({"error": str(e)}), 500

