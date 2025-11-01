from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
from src.models.notion_models import db, DailyTask, WeeklyGoal, Metric

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/daily', methods=['GET'])
def get_daily_tasks():
    """指定日の日次タスクを取得"""
    date_str = request.args.get('date', date.today().isoformat())
    try:
        target_date = datetime.fromisoformat(date_str).date()
    except ValueError:
        return jsonify({"error": "無効な日付形式です"}), 400
    
    tasks = DailyTask.query.filter_by(date=target_date).all()
    
    return jsonify({
        "tasks": [
            {
                "id": task.id,
                "notion_id": task.notion_id,
                "name": task.name,
                "completed": task.completed,
                "date": task.date.isoformat(),
                "category": task.category,
                "duration": task.duration,
                "notes": task.notes,
                "updated_at": task.updated_at.isoformat()
            }
            for task in tasks
        ]
    }), 200

@tasks_bp.route('/daily', methods=['POST'])
def create_daily_task():
    """新しい日次タスクを作成"""
    data = request.get_json()
    
    required_fields = ['name', 'date']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field}は必須です"}), 400
    
    try:
        task_date = datetime.fromisoformat(data['date']).date()
    except ValueError:
        return jsonify({"error": "無効な日付形式です"}), 400
    
    task = DailyTask(
        name=data['name'],
        completed=data.get('completed', False),
        date=task_date,
        category=data.get('category'),
        duration=data.get('duration'),
        notes=data.get('notes')
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify({
        "id": task.id,
        "message": "タスクが作成されました"
    }), 201

@tasks_bp.route('/daily/<int:task_id>', methods=['PUT'])
def update_daily_task(task_id):
    """日次タスクを更新"""
    task = DailyTask.query.get_or_404(task_id)
    data = request.get_json()
    
    # 更新可能なフィールド
    updatable_fields = ['name', 'completed', 'category', 'duration', 'notes']
    
    for field in updatable_fields:
        if field in data:
            setattr(task, field, data[field])
    
    if 'date' in data:
        try:
            task.date = datetime.fromisoformat(data['date']).date()
        except ValueError:
            return jsonify({"error": "無効な日付形式です"}), 400
    
    task.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({"message": "タスクが更新されました"}), 200

@tasks_bp.route('/daily/<int:task_id>', methods=['DELETE'])
def delete_daily_task(task_id):
    """日次タスクを削除"""
    task = DailyTask.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({"message": "タスクが削除されました"}), 200

@tasks_bp.route('/weekly', methods=['GET'])
def get_weekly_goals():
    """指定週の週間目標を取得"""
    week_str = request.args.get('week')
    
    if week_str:
        try:
            week_start = datetime.fromisoformat(week_str).date()
            # 週の開始日（月曜日）に調整
            week_start = week_start - timedelta(days=week_start.weekday())
        except ValueError:
            return jsonify({"error": "無効な日付形式です"}), 400
    else:
        # 今週の開始日を計算
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
    
    goals = WeeklyGoal.query.filter_by(week_start=week_start).all()
    
    return jsonify({
        "goals": [
            {
                "id": goal.id,
                "notion_id": goal.notion_id,
                "name": goal.name,
                "current": goal.current,
                "target": goal.target,
                "week_start": goal.week_start.isoformat(),
                "unit": goal.unit,
                "progress": (goal.current / goal.target * 100) if goal.target > 0 else 0,
                "updated_at": goal.updated_at.isoformat()
            }
            for goal in goals
        ],
        "week_start": week_start.isoformat()
    }), 200

@tasks_bp.route('/weekly', methods=['POST'])
def create_weekly_goal():
    """新しい週間目標を作成"""
    data = request.get_json()
    
    required_fields = ['name', 'target', 'week_start']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field}は必須です"}), 400
    
    try:
        week_start = datetime.fromisoformat(data['week_start']).date()
        # 週の開始日（月曜日）に調整
        week_start = week_start - timedelta(days=week_start.weekday())
    except ValueError:
        return jsonify({"error": "無効な日付形式です"}), 400
    
    goal = WeeklyGoal(
        name=data['name'],
        current=data.get('current', 0),
        target=data['target'],
        week_start=week_start,
        unit=data.get('unit', '回')
    )
    
    db.session.add(goal)
    db.session.commit()
    
    return jsonify({
        "id": goal.id,
        "message": "週間目標が作成されました"
    }), 201

@tasks_bp.route('/weekly/<int:goal_id>', methods=['PUT'])
def update_weekly_goal(goal_id):
    """週間目標を更新"""
    goal = WeeklyGoal.query.get_or_404(goal_id)
    data = request.get_json()
    
    # 更新可能なフィールド
    updatable_fields = ['name', 'current', 'target', 'unit']
    
    for field in updatable_fields:
        if field in data:
            setattr(goal, field, data[field])
    
    goal.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({"message": "週間目標が更新されました"}), 200

@tasks_bp.route('/weekly/<int:goal_id>', methods=['DELETE'])
def delete_weekly_goal(goal_id):
    """週間目標を削除"""
    goal = WeeklyGoal.query.get_or_404(goal_id)
    db.session.delete(goal)
    db.session.commit()
    
    return jsonify({"message": "週間目標が削除されました"}), 200

@tasks_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """指定週のメトリクスを取得"""
    week_str = request.args.get('week')
    
    if week_str:
        try:
            week_start = datetime.fromisoformat(week_str).date()
            # 週の開始日（月曜日）に調整
            week_start = week_start - timedelta(days=week_start.weekday())
        except ValueError:
            return jsonify({"error": "無効な日付形式です"}), 400
    else:
        # 今週の開始日を計算
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
    
    week_end = week_start + timedelta(days=6)
    
    metrics = Metric.query.filter(
        Metric.date >= week_start,
        Metric.date <= week_end
    ).all()
    
    # メトリクス名ごとにグループ化
    metrics_by_name = {}
    for metric in metrics:
        if metric.name not in metrics_by_name:
            metrics_by_name[metric.name] = {
                "name": metric.name,
                "days": [False] * 7,
                "total_score": 0
            }
        
        day_index = (metric.date - week_start).days
        if 0 <= day_index < 7:
            metrics_by_name[metric.name]["days"][day_index] = metric.completed
            if metric.completed:
                metrics_by_name[metric.name]["total_score"] += 1
    
    return jsonify({
        "metrics": list(metrics_by_name.values()),
        "week_start": week_start.isoformat(),
        "total_score": sum(m["total_score"] for m in metrics_by_name.values()),
        "max_score": len(metrics_by_name) * 7
    }), 200

@tasks_bp.route('/metrics', methods=['PUT'])
def update_metric():
    """メトリクスを更新"""
    data = request.get_json()
    
    required_fields = ['name', 'date', 'completed']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field}は必須です"}), 400
    
    try:
        metric_date = datetime.fromisoformat(data['date']).date()
    except ValueError:
        return jsonify({"error": "無効な日付形式です"}), 400
    
    # 既存のメトリクスを検索
    metric = Metric.query.filter_by(
        name=data['name'],
        date=metric_date
    ).first()
    
    if metric:
        # 既存のメトリクスを更新
        metric.completed = data['completed']
        metric.updated_at = datetime.utcnow()
    else:
        # 新しいメトリクスを作成
        week_start = metric_date - timedelta(days=metric_date.weekday())
        metric = Metric(
            name=data['name'],
            date=metric_date,
            completed=data['completed'],
            week_start=week_start,
            score=1 if data['completed'] else 0
        )
        db.session.add(metric)
    
    db.session.commit()
    
    return jsonify({"message": "メトリクスが更新されました"}), 200

@tasks_bp.route('/summary', methods=['GET'])
def get_summary():
    """ダッシュボード用のサマリーデータを取得"""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    # 今日のタスク
    daily_tasks = DailyTask.query.filter_by(date=today).all()
    completed_tasks = sum(1 for task in daily_tasks if task.completed)
    
    # 今週の目標
    weekly_goals = WeeklyGoal.query.filter_by(week_start=week_start).all()
    weekly_progress = 0
    if weekly_goals:
        total_progress = sum(
            (goal.current / goal.target) if goal.target > 0 else 0
            for goal in weekly_goals
        )
        weekly_progress = (total_progress / len(weekly_goals)) * 100
    
    # 今週のメトリクス
    metrics = Metric.query.filter(
        Metric.date >= week_start,
        Metric.date <= week_end
    ).all()
    
    metrics_score = sum(1 for metric in metrics if metric.completed)
    
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
            "score": metrics_score,
            "max_score": len(set(metric.name for metric in metrics)) * 7,
            "percentage": (metrics_score / (len(set(metric.name for metric in metrics)) * 7) * 100) if metrics else 0
        }
    }), 200

