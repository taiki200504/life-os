from flask import Blueprint, request, jsonify
from datetime import datetime, date
from src.models.user import db, Task, TaskStatus, User

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    """タスク作成API"""
    try:
        data = request.get_json()
        
        # 必須フィールドの検証
        if not data or 'title' not in data:
            return jsonify({'error': 'Title is required'}), 400
        
        # デフォルトユーザーID（認証実装まで）
        user_id = data.get('user_id', 'default-user')
        
        # ユーザーが存在しない場合は作成
        user = User.query.filter_by(id=user_id).first()
        if not user:
            user = User(
                id=user_id,
                email=f'{user_id}@example.com',
                display_name='Default User'
            )
            db.session.add(user)
            db.session.commit()
        
        # ステータスの検証
        status = TaskStatus.INBOX
        if 'status' in data:
            try:
                status = TaskStatus(data['status'])
            except ValueError:
                return jsonify({'error': 'Invalid status'}), 400
        
        # 締切日の解析
        deadline = None
        if 'deadline' in data and data['deadline']:
            try:
                deadline = datetime.strptime(data['deadline'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid deadline format. Use YYYY-MM-DD'}), 400
        
        # 新しいタスクを作成
        task = Task(
            user_id=user_id,
            title=data['title'],
            status=status,
            area=data.get('area'),
            impact=data.get('impact'),
            effort=data.get('effort'),
            deadline=deadline,
            context=data.get('context', [])
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'message': 'Task created',
            'task': task.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """タスク一覧取得API"""
    try:
        user_id = request.args.get('user_id', 'default-user')
        status = request.args.get('status')
        area = request.args.get('area')
        limit = request.args.get('limit', 100, type=int)
        
        query = Task.query.filter_by(user_id=user_id)
        
        # ステータスフィルタ
        if status:
            try:
                status_enum = TaskStatus(status)
                query = query.filter_by(status=status_enum)
            except ValueError:
                return jsonify({'error': 'Invalid status'}), 400
        
        # エリアフィルタ
        if area:
            query = query.filter_by(area=area)
        
        tasks = query.order_by(Task.created_at.desc()).limit(limit).all()
        
        return jsonify({
            'tasks': [task.to_dict() for task in tasks]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    """特定タスク取得API"""
    try:
        task = Task.query.filter_by(id=task_id).first()
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        return jsonify({'task': task.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    """タスク更新API"""
    try:
        data = request.get_json()
        
        task = Task.query.filter_by(id=task_id).first()
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # 更新可能フィールド
        if 'title' in data:
            task.title = data['title']
        
        if 'status' in data:
            try:
                task.status = TaskStatus(data['status'])
            except ValueError:
                return jsonify({'error': 'Invalid status'}), 400
        
        if 'area' in data:
            task.area = data['area']
        
        if 'impact' in data:
            task.impact = data['impact']
        
        if 'effort' in data:
            task.effort = data['effort']
        
        if 'deadline' in data:
            if data['deadline']:
                try:
                    task.deadline = datetime.strptime(data['deadline'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Invalid deadline format. Use YYYY-MM-DD'}), 400
            else:
                task.deadline = None
        
        if 'context' in data:
            task.context = data['context']
        
        task.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Task updated',
            'task': task.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    """タスク削除API"""
    try:
        task = Task.query.filter_by(id=task_id).first()
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'Task deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<task_id>/move', methods=['POST'])
def move_task(task_id):
    """タスクステータス変更API"""
    try:
        data = request.get_json()
        
        if not data or 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
        
        task = Task.query.filter_by(id=task_id).first()
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        try:
            new_status = TaskStatus(data['status'])
        except ValueError:
            return jsonify({'error': 'Invalid status'}), 400
        
        old_status = task.status
        task.status = new_status
        task.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Task moved from {old_status.value} to {new_status.value}',
            'task': task.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/inbox', methods=['GET'])
def get_inbox_tasks():
    """INBOX タスク取得API"""
    try:
        user_id = request.args.get('user_id', 'default-user')
        
        tasks = Task.query.filter_by(user_id=user_id, status=TaskStatus.INBOX)\
                         .order_by(Task.created_at.desc()).all()
        
        return jsonify({
            'tasks': [task.to_dict() for task in tasks],
            'count': len(tasks)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/today', methods=['GET'])
def get_today_tasks():
    """TODAY タスク取得API"""
    try:
        user_id = request.args.get('user_id', 'default-user')
        
        tasks = Task.query.filter_by(user_id=user_id, status=TaskStatus.TODAY)\
                         .order_by(Task.created_at.desc()).all()
        
        return jsonify({
            'tasks': [task.to_dict() for task in tasks],
            'count': len(tasks)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/done', methods=['GET'])
def get_done_tasks():
    """DONE タスク取得API"""
    try:
        user_id = request.args.get('user_id', 'default-user')
        limit = request.args.get('limit', 50, type=int)
        
        tasks = Task.query.filter_by(user_id=user_id, status=TaskStatus.DONE)\
                         .order_by(Task.updated_at.desc()).limit(limit).all()
        
        return jsonify({
            'tasks': [task.to_dict() for task in tasks],
            'count': len(tasks)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

