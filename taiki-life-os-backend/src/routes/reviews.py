from flask import Blueprint, request, jsonify
from datetime import datetime, date
from src.models.user import db, DailyReview, User

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/reviews/daily', methods=['POST'])
def create_daily_review():
    """日次レビュー作成API"""
    try:
        data = request.get_json()
        
        # 必須フィールドの検証
        required_fields = ['date', 'deep_work_min']
        for field in required_fields:
            if not data or field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
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
        
        # 日付の解析
        try:
            review_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # 既存のレビューをチェック
        existing_review = DailyReview.query.filter_by(
            user_id=user_id, 
            date=review_date
        ).first()
        
        if existing_review:
            # 既存のレビューを更新
            existing_review.deep_work_min = data['deep_work_min']
            existing_review.top3 = data.get('top3', [])
            existing_review.blockers = data.get('blockers', [])
            existing_review.learn = data.get('learn', '')
            existing_review.stop_doing = data.get('stop_doing', '')
            existing_review.score = data.get('score')
            
            db.session.commit()
            
            return jsonify({
                'message': 'Daily review updated',
                'review': existing_review.to_dict()
            }), 200
        else:
            # 新しいレビューを作成
            review = DailyReview(
                user_id=user_id,
                date=review_date,
                deep_work_min=data['deep_work_min'],
                top3=data.get('top3', []),
                blockers=data.get('blockers', []),
                learn=data.get('learn', ''),
                stop_doing=data.get('stop_doing', ''),
                score=data.get('score')
            )
            
            db.session.add(review)
            db.session.commit()
            
            return jsonify({
                'message': 'Daily review created',
                'review': review.to_dict()
            }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/reviews/daily', methods=['GET'])
def get_daily_reviews():
    """日次レビュー一覧取得API"""
    try:
        user_id = request.args.get('user_id', 'default-user')
        limit = request.args.get('limit', 30, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = DailyReview.query.filter_by(user_id=user_id)
        
        # 日付範囲フィルタ
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(DailyReview.date >= start_date_obj)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(DailyReview.date <= end_date_obj)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        reviews = query.order_by(DailyReview.date.desc()).limit(limit).all()
        
        return jsonify({
            'reviews': [review.to_dict() for review in reviews]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/reviews/daily/<review_date>', methods=['GET'])
def get_daily_review(review_date):
    """特定日の日次レビュー取得API"""
    try:
        user_id = request.args.get('user_id', 'default-user')
        
        # 日付の解析
        try:
            date_obj = datetime.strptime(review_date, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        review = DailyReview.query.filter_by(
            user_id=user_id, 
            date=date_obj
        ).first()
        
        if not review:
            return jsonify({'review': None}), 200
        
        return jsonify({'review': review.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/reviews/daily/today', methods=['GET'])
def get_today_review():
    """今日の日次レビュー取得API"""
    try:
        user_id = request.args.get('user_id', 'default-user')
        today = date.today()
        
        review = DailyReview.query.filter_by(
            user_id=user_id, 
            date=today
        ).first()
        
        return jsonify({
            'review': review.to_dict() if review else None,
            'date': today.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reviews_bp.route('/reviews/daily/<review_id>', methods=['DELETE'])
def delete_daily_review(review_id):
    """日次レビュー削除API"""
    try:
        review = DailyReview.query.filter_by(id=review_id).first()
        if not review:
            return jsonify({'error': 'Review not found'}), 404
        
        db.session.delete(review)
        db.session.commit()
        
        return jsonify({'message': 'Review deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

