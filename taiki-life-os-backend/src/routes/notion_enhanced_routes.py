from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
from src.services.notion_enhanced_service import NotionEnhancedService
import os

notion_enhanced_bp = Blueprint('notion_enhanced', __name__)

def get_notion_service():
    """Notion強化サービスのインスタンスを取得"""
    api_key = os.getenv('NOTION_API_KEY')
    if not api_key:
        raise ValueError("NOTION_API_KEY environment variable is required")
    return NotionEnhancedService(api_key)

# ===== Daily Tasks API =====

@notion_enhanced_bp.route('/api/notion/daily-tasks', methods=['GET'])
def get_daily_tasks():
    """日次タスクを取得"""
    try:
        date_str = request.args.get('date')
        target_date = date.today()
        
        if date_str:
            try:
                target_date = datetime.fromisoformat(date_str).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        service = get_notion_service()
        tasks = service.get_daily_tasks(target_date)
        
        return jsonify({
            "success": True,
            "date": target_date.isoformat(),
            "tasks": tasks,
            "count": len(tasks)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notion_enhanced_bp.route('/api/notion/daily-tasks', methods=['POST'])
def create_daily_task():
    """新しい日次タスクを作成"""
    try:
        data = request.get_json()
        
        if not data or 'name' not in data or 'category' not in data:
            return jsonify({"error": "Name and category are required"}), 400
        
        service = get_notion_service()
        
        target_date = date.today()
        if 'date' in data:
            try:
                target_date = datetime.fromisoformat(data['date']).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        task_id = service.create_daily_task(
            name=data['name'],
            category=data['category'],
            target_date=target_date,
            duration=data.get('duration'),
            notes=data.get('notes')
        )
        
        if task_id:
            return jsonify({
                "success": True,
                "task_id": task_id,
                "message": "Daily task created successfully"
            })
        else:
            return jsonify({"error": "Failed to create daily task"}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notion_enhanced_bp.route('/api/notion/daily-tasks/<task_id>/complete', methods=['PATCH'])
def update_daily_task_completion(task_id):
    """日次タスクの完了状態を更新"""
    try:
        data = request.get_json()
        
        if not data or 'completed' not in data:
            return jsonify({"error": "Completed status is required"}), 400
        
        service = get_notion_service()
        success = service.update_daily_task_completion(task_id, data['completed'])
        
        if success:
            return jsonify({
                "success": True,
                "message": "Task completion status updated successfully"
            })
        else:
            return jsonify({"error": "Failed to update task completion status"}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notion_enhanced_bp.route('/api/notion/daily-tasks/initialize', methods=['POST'])
def initialize_daily_tasks():
    """指定日のTaiki Life OS標準タスクを初期化"""
    try:
        data = request.get_json() or {}
        
        target_date = date.today()
        if 'date' in data:
            try:
                target_date = datetime.fromisoformat(data['date']).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        service = get_notion_service()
        task_ids = service.initialize_daily_tasks_for_date(target_date)
        
        return jsonify({
            "success": True,
            "date": target_date.isoformat(),
            "created_task_ids": task_ids,
            "count": len(task_ids),
            "message": f"Initialized {len(task_ids)} daily tasks for {target_date}"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== Weekly Goals API =====

@notion_enhanced_bp.route('/api/notion/weekly-goals', methods=['GET'])
def get_weekly_goals():
    """週間目標を取得"""
    try:
        week_start_str = request.args.get('week_start')
        week_start = None
        
        if week_start_str:
            try:
                week_start = datetime.fromisoformat(week_start_str).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        else:
            # 今週の月曜日を計算
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        service = get_notion_service()
        goals = service.get_weekly_goals(week_start)
        
        return jsonify({
            "success": True,
            "week_start": week_start.isoformat(),
            "goals": goals,
            "count": len(goals)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notion_enhanced_bp.route('/api/notion/weekly-goals', methods=['POST'])
def create_weekly_goal():
    """新しい週間目標を作成"""
    try:
        data = request.get_json()
        
        if not data or 'name' not in data or 'target' not in data:
            return jsonify({"error": "Name and target are required"}), 400
        
        service = get_notion_service()
        
        week_start = None
        if 'week_start' in data:
            try:
                week_start = datetime.fromisoformat(data['week_start']).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        goal_id = service.create_weekly_goal(
            name=data['name'],
            target=data['target'],
            unit=data.get('unit', '回'),
            week_start=week_start
        )
        
        if goal_id:
            return jsonify({
                "success": True,
                "goal_id": goal_id,
                "message": "Weekly goal created successfully"
            })
        else:
            return jsonify({"error": "Failed to create weekly goal"}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notion_enhanced_bp.route('/api/notion/weekly-goals/<goal_id>/progress', methods=['PATCH'])
def update_weekly_goal_progress(goal_id):
    """週間目標の進捗を更新"""
    try:
        data = request.get_json()
        
        if not data or 'current' not in data:
            return jsonify({"error": "Current progress is required"}), 400
        
        service = get_notion_service()
        success = service.update_weekly_goal_progress(goal_id, data['current'])
        
        if success:
            return jsonify({
                "success": True,
                "message": "Weekly goal progress updated successfully"
            })
        else:
            return jsonify({"error": "Failed to update weekly goal progress"}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notion_enhanced_bp.route('/api/notion/weekly-goals/initialize', methods=['POST'])
def initialize_weekly_goals():
    """指定週のTaiki Life OS標準週間目標を初期化"""
    try:
        data = request.get_json() or {}
        
        week_start = None
        if 'week_start' in data:
            try:
                week_start = datetime.fromisoformat(data['week_start']).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        else:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        service = get_notion_service()
        goal_ids = service.initialize_weekly_goals_for_week(week_start)
        
        return jsonify({
            "success": True,
            "week_start": week_start.isoformat(),
            "created_goal_ids": goal_ids,
            "count": len(goal_ids),
            "message": f"Initialized {len(goal_ids)} weekly goals for week starting {week_start}"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== Metrics API =====

@notion_enhanced_bp.route('/api/notion/metrics', methods=['GET'])
def get_metrics():
    """メトリクスを取得"""
    try:
        date_str = request.args.get('date')
        target_date = date.today()
        
        if date_str:
            try:
                target_date = datetime.fromisoformat(date_str).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        service = get_notion_service()
        metrics = service.get_metrics(target_date)
        
        return jsonify({
            "success": True,
            "date": target_date.isoformat(),
            "metrics": metrics,
            "count": len(metrics)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notion_enhanced_bp.route('/api/notion/metrics', methods=['POST'])
def create_metric():
    """新しいメトリクスを作成"""
    try:
        data = request.get_json()
        
        if not data or 'name' not in data or 'score' not in data:
            return jsonify({"error": "Name and score are required"}), 400
        
        service = get_notion_service()
        
        target_date = date.today()
        if 'date' in data:
            try:
                target_date = datetime.fromisoformat(data['date']).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        metric_id = service.create_metric(
            name=data['name'],
            score=data['score'],
            target_date=target_date,
            completed=data.get('completed', False)
        )
        
        if metric_id:
            return jsonify({
                "success": True,
                "metric_id": metric_id,
                "message": "Metric created successfully"
            })
        else:
            return jsonify({"error": "Failed to create metric"}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notion_enhanced_bp.route('/api/notion/metrics/<metric_id>/score', methods=['PATCH'])
def update_metric_score(metric_id):
    """メトリクスのスコアを更新"""
    try:
        data = request.get_json()
        
        if not data or 'score' not in data:
            return jsonify({"error": "Score is required"}), 400
        
        service = get_notion_service()
        success = service.update_metric_score(
            metric_id, 
            data['score'], 
            data.get('completed')
        )
        
        if success:
            return jsonify({
                "success": True,
                "message": "Metric score updated successfully"
            })
        else:
            return jsonify({"error": "Failed to update metric score"}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== Task Management API =====

@notion_enhanced_bp.route('/api/notion/task-management', methods=['GET'])
def get_task_management_tasks():
    """タスク管理データベースからタスクを取得"""
    try:
        project = request.args.get('project')
        priority = request.args.get('priority')
        completed = request.args.get('completed')
        
        # completed パラメータをbooleanに変換
        if completed is not None:
            completed = completed.lower() in ('true', '1', 'yes')
        
        service = get_notion_service()
        tasks = service.get_task_management_tasks(project, priority, completed)
        
        return jsonify({
            "success": True,
            "tasks": tasks,
            "count": len(tasks),
            "filters": {
                "project": project,
                "priority": priority,
                "completed": completed
            }
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== 統合同期API =====

@notion_enhanced_bp.route('/api/notion/sync/daily', methods=['GET'])
def sync_daily_data():
    """指定日の全データを同期"""
    try:
        date_str = request.args.get('date')
        target_date = date.today()
        
        if date_str:
            try:
                target_date = datetime.fromisoformat(date_str).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        service = get_notion_service()
        data = service.sync_daily_data(target_date)
        
        return jsonify({
            "success": True,
            "data": data,
            "message": f"Daily data synced for {target_date}"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notion_enhanced_bp.route('/api/notion/sync/weekly', methods=['GET'])
def sync_weekly_data():
    """指定週の全データを同期"""
    try:
        week_start_str = request.args.get('week_start')
        week_start = None
        
        if week_start_str:
            try:
                week_start = datetime.fromisoformat(week_start_str).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        else:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        service = get_notion_service()
        data = service.sync_weekly_data(week_start)
        
        return jsonify({
            "success": True,
            "data": data,
            "message": f"Weekly data synced for week starting {week_start}"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== 初期化API =====

@notion_enhanced_bp.route('/api/notion/initialize/today', methods=['POST'])
def initialize_today():
    """今日のデータを初期化（タスクと目標）"""
    try:
        service = get_notion_service()
        today = date.today()
        
        # 今日のタスクを初期化
        task_ids = service.initialize_daily_tasks_for_date(today)
        
        # 今週の目標を初期化（まだ存在しない場合）
        week_start = today - timedelta(days=today.weekday())
        existing_goals = service.get_weekly_goals(week_start)
        
        goal_ids = []
        if not existing_goals:
            goal_ids = service.initialize_weekly_goals_for_week(week_start)
        
        return jsonify({
            "success": True,
            "date": today.isoformat(),
            "week_start": week_start.isoformat(),
            "created_tasks": len(task_ids),
            "created_goals": len(goal_ids),
            "task_ids": task_ids,
            "goal_ids": goal_ids,
            "message": f"Initialized data for {today}"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

