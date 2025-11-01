from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from src.models.user import db, Session, User

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('/sessions/start', methods=['POST'])
def start_session():
    """セッション開始API"""
    try:
        data = request.get_json()
        
        # 必須フィールドの検証
        if not data or 'project' not in data:
            return jsonify({'error': 'Project is required'}), 400
        
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
        
        # 新しいセッションを作成
        session = Session(
            user_id=user_id,
            project=data['project'],
            planned_min=data.get('duration', 90),
            context=data.get('context', []),
            start_at=datetime.utcnow()
        )
        
        db.session.add(session)
        db.session.commit()
        
        # 予定終了時刻を計算
        planned_end = session.start_at + timedelta(minutes=session.planned_min)
        
        return jsonify({
            'id': session.id,
            'planned_end': planned_end.isoformat(),
            'session': session.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@sessions_bp.route('/sessions/stop', methods=['POST'])
def stop_session():
    """セッション終了API"""
    try:
        data = request.get_json()
        
        if not data or 'id' not in data:
            return jsonify({'error': 'Session ID is required'}), 400
        
        session = Session.query.filter_by(id=data['id']).first()
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        if session.end_at:
            return jsonify({'error': 'Session already stopped'}), 400
        
        # セッション終了
        session.end_at = datetime.utcnow()
        session.actual_min = int((session.end_at - session.start_at).total_seconds() / 60)
        
        # ノートがあれば追加
        if 'notes' in data:
            session.notes = data['notes']
        
        db.session.commit()
        
        return jsonify({
            'actual_min': session.actual_min,
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@sessions_bp.route('/sessions/pause', methods=['POST'])
def pause_session():
    """セッション一時停止API（将来拡張）"""
    return jsonify({'message': 'Pause functionality not implemented yet'}), 501

@sessions_bp.route('/sessions/resume', methods=['POST'])
def resume_session():
    """セッション再開API（将来拡張）"""
    return jsonify({'message': 'Resume functionality not implemented yet'}), 501

@sessions_bp.route('/sessions', methods=['GET'])
def get_sessions():
    """セッション一覧取得API"""
    try:
        user_id = request.args.get('user_id', 'default-user')
        limit = request.args.get('limit', 50, type=int)
        
        sessions = Session.query.filter_by(user_id=user_id)\
                               .order_by(Session.start_at.desc())\
                               .limit(limit).all()
        
        return jsonify({
            'sessions': [session.to_dict() for session in sessions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sessions_bp.route('/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    """特定セッション取得API"""
    try:
        session = Session.query.filter_by(id=session_id).first()
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        return jsonify({'session': session.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sessions_bp.route('/sessions/active', methods=['GET'])
def get_active_session():
    """アクティブセッション取得API"""
    try:
        user_id = request.args.get('user_id', 'default-user')
        
        active_session = Session.query.filter_by(user_id=user_id, end_at=None)\
                                    .order_by(Session.start_at.desc())\
                                    .first()
        
        if not active_session:
            return jsonify({'active_session': None}), 200
        
        return jsonify({'active_session': active_session.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

