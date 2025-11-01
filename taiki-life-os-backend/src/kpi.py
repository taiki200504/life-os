from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
from sqlalchemy import func, and_
from src.models.user import db, Session, Task, TaskStatus, DailyReview

kpi_bp = Blueprint('kpi', __name__)

@kpi_bp.route('/kpi/dashboard', methods=['GET'])
def get_kpi_dashboard():
    """KPIダッシュボード取得API"""
    try:
        user_id = request.args.get('user_id', 'default-user')
        target_date = request.args.get('date')
        
        # 対象日の設定
        if target_date:
            try:
                date_obj = datetime.strptime(target_date, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        else:
            date_obj = date.today()
        
        # 週の開始日（月曜日）を計算
        week_start = date_obj - timedelta(days=date_obj.weekday())
        week_end = week_start + timedelta(days=6)
        
        # 1. ルーティン実行率（start→stop連続完了）
        routine_rate = calculate_routine_rate(user_id, date_obj)
        
        # 2. Deep Work合計（週）
        weekly_deep_work = calculate_weekly_deep_work(user_id, week_start, week_end)
        
        # 3. INBOX滞留（24h超）
        inbox_overdue = calculate_inbox_overdue(user_id)
        
        # 4. 日次レビュー提出率
        review_rate = calculate_review_rate(user_id, week_start, week_end)
        
        # 5. 自動化比率（将来実装）
        automation_rate = 0  # プレースホルダー
        
        # 6. 今日のセッション統計
        today_sessions = get_today_sessions_stats(user_id, date_obj)
        
        # 7. タスク統計
        task_stats = get_task_stats(user_id)
        
        return jsonify({
            'date': date_obj.isoformat(),
            'week_range': {
                'start': week_start.isoformat(),
                'end': week_end.isoformat()
            },
            'kpis': {
                'routine_execution_rate': {
                    'value': routine_rate,
                    'target': 85,
                    'unit': '%',
                    'status': 'good' if routine_rate >= 85 else 'warning' if routine_rate >= 70 else 'danger'
                },
                'weekly_deep_work': {
                    'value': weekly_deep_work,
                    'target': 2100,  # 35h * 60min
                    'unit': 'minutes',
                    'status': 'good' if weekly_deep_work >= 2100 else 'warning' if weekly_deep_work >= 1800 else 'danger'
                },
                'inbox_overdue': {
                    'value': inbox_overdue,
                    'target': 0,
                    'unit': 'tasks',
                    'status': 'good' if inbox_overdue == 0 else 'danger'
                },
                'review_submission_rate': {
                    'value': review_rate,
                    'target': 100,
                    'unit': '%',
                    'status': 'good' if review_rate == 100 else 'warning' if review_rate >= 80 else 'danger'
                },
                'automation_rate': {
                    'value': automation_rate,
                    'target': 40,
                    'unit': '%',
                    'status': 'warning'  # 未実装
                }
            },
            'today_sessions': today_sessions,
            'task_stats': task_stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_routine_rate(user_id, target_date):
    """ルーティン実行率を計算"""
    try:
        # 過去7日間のセッション完了率を計算
        week_ago = target_date - timedelta(days=7)
        
        total_sessions = Session.query.filter(
            and_(
                Session.user_id == user_id,
                Session.start_at >= week_ago,
                Session.start_at < target_date + timedelta(days=1)
            )
        ).count()
        
        completed_sessions = Session.query.filter(
            and_(
                Session.user_id == user_id,
                Session.start_at >= week_ago,
                Session.start_at < target_date + timedelta(days=1),
                Session.end_at.isnot(None)
            )
        ).count()
        
        if total_sessions == 0:
            return 0
        
        return round((completed_sessions / total_sessions) * 100, 1)
        
    except Exception:
        return 0

def calculate_weekly_deep_work(user_id, week_start, week_end):
    """週間Deep Work時間を計算"""
    try:
        result = db.session.query(func.sum(Session.actual_min)).filter(
            and_(
                Session.user_id == user_id,
                Session.start_at >= week_start,
                Session.start_at <= week_end + timedelta(days=1),
                Session.end_at.isnot(None)
            )
        ).scalar()
        
        return result or 0
        
    except Exception:
        return 0

def calculate_inbox_overdue(user_id):
    """INBOX滞留タスク数を計算"""
    try:
        yesterday = datetime.utcnow() - timedelta(hours=24)
        
        overdue_count = Task.query.filter(
            and_(
                Task.user_id == user_id,
                Task.status == TaskStatus.INBOX,
                Task.created_at < yesterday
            )
        ).count()
        
        return overdue_count
        
    except Exception:
        return 0

def calculate_review_rate(user_id, week_start, week_end):
    """日次レビュー提出率を計算"""
    try:
        # 週の日数
        total_days = (week_end - week_start).days + 1
        
        # 提出済みレビュー数
        submitted_reviews = DailyReview.query.filter(
            and_(
                DailyReview.user_id == user_id,
                DailyReview.date >= week_start,
                DailyReview.date <= week_end
            )
        ).count()
        
        return round((submitted_reviews / total_days) * 100, 1)
        
    except Exception:
        return 0

def get_today_sessions_stats(user_id, target_date):
    """今日のセッション統計を取得"""
    try:
        today_start = datetime.combine(target_date, datetime.min.time())
        today_end = today_start + timedelta(days=1)
        
        sessions = Session.query.filter(
            and_(
                Session.user_id == user_id,
                Session.start_at >= today_start,
                Session.start_at < today_end
            )
        ).all()
        
        total_sessions = len(sessions)
        completed_sessions = len([s for s in sessions if s.end_at])
        active_sessions = len([s for s in sessions if not s.end_at])
        
        total_minutes = sum([s.actual_min for s in sessions if s.actual_min])
        
        return {
            'total_sessions': total_sessions,
            'completed_sessions': completed_sessions,
            'active_sessions': active_sessions,
            'total_minutes': total_minutes,
            'sessions': [session.to_dict() for session in sessions]
        }
        
    except Exception:
        return {
            'total_sessions': 0,
            'completed_sessions': 0,
            'active_sessions': 0,
            'total_minutes': 0,
            'sessions': []
        }

def get_task_stats(user_id):
    """タスク統計を取得"""
    try:
        inbox_count = Task.query.filter_by(user_id=user_id, status=TaskStatus.INBOX).count()
        today_count = Task.query.filter_by(user_id=user_id, status=TaskStatus.TODAY).count()
        done_count = Task.query.filter_by(user_id=user_id, status=TaskStatus.DONE).count()
        
        return {
            'inbox': inbox_count,
            'today': today_count,
            'done': done_count,
            'total': inbox_count + today_count + done_count
        }
        
    except Exception:
        return {
            'inbox': 0,
            'today': 0,
            'done': 0,
            'total': 0
        }

@kpi_bp.route('/kpi/trends', methods=['GET'])
def get_kpi_trends():
    """KPIトレンド取得API"""
    try:
        user_id = request.args.get('user_id', 'default-user')
        days = request.args.get('days', 30, type=int)
        
        end_date = date.today()
        start_date = end_date - timedelta(days=days-1)
        
        trends = []
        current_date = start_date
        
        while current_date <= end_date:
            # 各日のKPIを計算
            routine_rate = calculate_routine_rate(user_id, current_date)
            
            # その日のDeep Work時間
            day_start = datetime.combine(current_date, datetime.min.time())
            day_end = day_start + timedelta(days=1)
            
            daily_deep_work = db.session.query(func.sum(Session.actual_min)).filter(
                and_(
                    Session.user_id == user_id,
                    Session.start_at >= day_start,
                    Session.start_at < day_end,
                    Session.end_at.isnot(None)
                )
            ).scalar() or 0
            
            trends.append({
                'date': current_date.isoformat(),
                'routine_rate': routine_rate,
                'deep_work_minutes': daily_deep_work
            })
            
            current_date += timedelta(days=1)
        
        return jsonify({
            'trends': trends,
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': days
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

