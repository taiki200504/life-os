"""
タスク関連API - Notion中心の実装（SQLite不要）
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
import os
from src.services.notion_unified_service import NotionUnifiedService

tasks_bp = Blueprint('tasks', __name__)

def get_notion_service():
    """Notionサービスのインスタンスを取得"""
    api_key = os.getenv('NOTION_API_KEY')
    if not api_key:
        raise ValueError("NOTION_API_KEY environment variable is required")
    return NotionUnifiedService(api_key)

@tasks_bp.route('/daily', methods=['GET'])
def get_daily_tasks():
    """指定日の日次タスクを取得（Notionから）"""
    try:
        date_str = request.args.get('date', date.today().isoformat())
        try:
            target_date = datetime.fromisoformat(date_str).date()
        except ValueError:
            return jsonify({"error": "無効な日付形式です"}), 400
        
        service = get_notion_service()
        tasks = service.get_taiki_tasks(target_date)
        
        return jsonify({
            "tasks": tasks
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@tasks_bp.route('/daily', methods=['POST'])
def create_daily_task():
    """新しい日次タスクを作成（Notionに）"""
    try:
        data = request.get_json()
        
        if 'name' not in data:
            return jsonify({"error": "nameは必須です"}), 400
        
        target_date = date.today()
        if 'date' in data:
            try:
                target_date = datetime.fromisoformat(data['date']).date()
            except ValueError:
                return jsonify({"error": "無効な日付形式です"}), 400
        
        service = get_notion_service()
        task_id = service.create_taiki_task(
            name=data['name'],
            completed=data.get('completed', False),
            target_date=target_date,
            category=data.get('category')
        )
        
        if task_id:
            return jsonify({
                "notion_id": task_id,
                "message": "タスクが作成されました"
            }), 201
        else:
            return jsonify({"error": "タスクの作成に失敗しました"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@tasks_bp.route('/daily/<task_id>', methods=['PUT'])
def update_daily_task(task_id):
    """日次タスクを更新（Notionで）"""
    try:
        data = request.get_json()
        service = get_notion_service()
        
        properties = {}
        if 'name' in data:
            properties["Name"] = {
                "title": [{"text": {"content": data['name']}}]
            }
        if 'completed' in data:
            properties["Completed"] = {
                "checkbox": data['completed']
            }
        if 'category' in data:
            properties["Category"] = {
                "select": {"name": data['category']}
            }
        
        if properties:
            success = service.update_taiki_task(task_id, properties)
            if success:
                return jsonify({"message": "タスクが更新されました"}), 200
            else:
                return jsonify({"error": "タスクの更新に失敗しました"}), 500
        else:
            return jsonify({"error": "更新するフィールドがありません"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@tasks_bp.route('/daily/<task_id>', methods=['DELETE'])
def delete_daily_task(task_id):
    """日次タスクを削除（Notionから）"""
    try:
        service = get_notion_service()
        success = service.delete_taiki_task(task_id)
        
        if success:
            return jsonify({"message": "タスクが削除されました"}), 200
        else:
            return jsonify({"error": "タスクの削除に失敗しました"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@tasks_bp.route('/weekly', methods=['GET'])
def get_weekly_goals():
    """指定週の週間目標を取得（Notionから）"""
    try:
        week_str = request.args.get('week')
        
        if week_str:
            try:
                week_start = datetime.fromisoformat(week_str).date()
                week_start = week_start - timedelta(days=week_start.weekday())
            except ValueError:
                return jsonify({"error": "無効な日付形式です"}), 400
        else:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        service = get_notion_service()
        goals = service.get_weekly_goals(week_start)
        
        return jsonify({
            "goals": goals,
            "week_start": week_start.isoformat()
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@tasks_bp.route('/weekly', methods=['POST'])
def create_weekly_goal():
    """新しい週間目標を作成（Notionに）"""
    try:
        data = request.get_json()
        
        if 'name' not in data or 'target' not in data:
            return jsonify({"error": "nameとtargetは必須です"}), 400
        
        week_start = date.today()
        if 'week_start' in data:
            try:
                week_start = datetime.fromisoformat(data['week_start']).date()
                week_start = week_start - timedelta(days=week_start.weekday())
            except ValueError:
                return jsonify({"error": "無効な日付形式です"}), 400
        else:
            week_start = week_start - timedelta(days=week_start.weekday())
        
        service = get_notion_service()
        goal_id = service.create_weekly_goal(
            name=data['name'],
            current=data.get('current', 0),
            target=data['target'],
            unit=data.get('unit', '回'),
            week_start=week_start
        )
        
        if goal_id:
            return jsonify({
                "notion_id": goal_id,
                "message": "週間目標が作成されました"
            }), 201
        else:
            return jsonify({"error": "週間目標の作成に失敗しました"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@tasks_bp.route('/weekly/<goal_id>', methods=['PUT'])
def update_weekly_goal(goal_id):
    """週間目標を更新（Notionで）"""
    try:
        data = request.get_json()
        service = get_notion_service()
        
        properties = {}
        if 'name' in data:
            properties["Name"] = {
                "title": [{"text": {"content": data['name']}}]
            }
        if 'current' in data:
            properties["Current"] = {
                "number": data['current']
            }
        if 'target' in data:
            properties["Target"] = {
                "number": data['target']
            }
        if 'unit' in data:
            properties["Unit"] = {
                "select": {"name": data['unit']}
            }
        
        if properties:
            success = service.update_page(goal_id, properties)
            if success:
                return jsonify({"message": "週間目標が更新されました"}), 200
            else:
                return jsonify({"error": "週間目標の更新に失敗しました"}), 500
        else:
            return jsonify({"error": "更新するフィールドがありません"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@tasks_bp.route('/weekly/<goal_id>', methods=['DELETE'])
def delete_weekly_goal(goal_id):
    """週間目標を削除（Notionから）"""
    try:
        service = get_notion_service()
        success = service.delete_page(goal_id)
        
        if success:
            return jsonify({"message": "週間目標が削除されました"}), 200
        else:
            return jsonify({"error": "週間目標の削除に失敗しました"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@tasks_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """メトリクス取得（削除済み機能のため空レスポンス）"""
    return jsonify({
        "metrics": [],
        "message": "メトリクス機能は削除されました"
    }), 200

@tasks_bp.route('/metrics', methods=['PUT'])
def update_metric():
    """メトリクス更新（削除済み機能のため空レスポンス）"""
    return jsonify({
        "message": "メトリクス機能は削除されました"
    }), 200

@tasks_bp.route('/summary', methods=['GET'])
def get_summary():
    """ダッシュボード用のサマリーデータを取得（Notionから）"""
    try:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        
        service = get_notion_service()
        
        # 今日のタスク
        daily_tasks = service.get_taiki_tasks(today)
        completed_tasks = sum(1 for task in daily_tasks if task.get('completed', False))
        
        # 今週の目標
        weekly_goals = service.get_weekly_goals(week_start)
        weekly_progress = 0
        if weekly_goals:
            total_progress = sum(
                (goal.get('current', 0) / goal.get('target', 1)) if goal.get('target', 0) > 0 else 0
                for goal in weekly_goals
            )
            weekly_progress = (total_progress / len(weekly_goals)) * 100
        
        return jsonify({
            "daily": {
                "completed": completed_tasks,
                "total": len(daily_tasks),
                "progress": (completed_tasks / len(daily_tasks) * 100) if daily_tasks else 0
            },
            "weekly": {
                "progress": weekly_progress,
                "goals_count": len(weekly_goals)
            },
            "metrics": {
                "score": 0,
                "max_score": 0,
                "percentage": 0,
                "message": "メトリクス機能は削除されました"
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
