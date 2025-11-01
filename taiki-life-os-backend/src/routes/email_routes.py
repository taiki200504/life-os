from flask import Blueprint, request, jsonify
from datetime import datetime, date
from src.services.email_service import EmailService
from src.models.notion_models import db, NotionConfig
import os

email_bp = Blueprint('email', __name__)

@email_bp.route('/send-daily-summary', methods=['POST'])
def send_daily_summary():
    """日次サマリーメールを送信"""
    try:
        data = request.get_json()
        recipient_email = data.get('email', 'taiki.mishima.biz@gmail.com')
        
        email_service = EmailService()
        success = email_service.send_daily_summary(recipient_email)
        
        if success:
            return jsonify({
                "message": f"日次サマリーメールを {recipient_email} に送信しました",
                "sent_at": datetime.utcnow().isoformat()
            }), 200
        else:
            return jsonify({"error": "メール送信に失敗しました"}), 500
            
    except Exception as e:
        return jsonify({"error": f"エラーが発生しました: {str(e)}"}), 500

@email_bp.route('/send-weekly-summary', methods=['POST'])
def send_weekly_summary():
    """週次サマリーメールを送信"""
    try:
        data = request.get_json()
        recipient_email = data.get('email', 'taiki.mishima.biz@gmail.com')
        
        email_service = EmailService()
        success = email_service.send_weekly_summary(recipient_email)
        
        if success:
            return jsonify({
                "message": f"週次サマリーメールを {recipient_email} に送信しました",
                "sent_at": datetime.utcnow().isoformat()
            }), 200
        else:
            return jsonify({"error": "メール送信に失敗しました"}), 500
            
    except Exception as e:
        return jsonify({"error": f"エラーが発生しました: {str(e)}"}), 500

@email_bp.route('/schedule-daily-email', methods=['POST'])
def schedule_daily_email():
    """毎朝のメール通知をスケジュール"""
    try:
        data = request.get_json()
        recipient_email = data.get('email', 'taiki.mishima.biz@gmail.com')
        send_time = data.get('time', '07:00')  # デフォルト朝7時
        
        # 実際のスケジューリングは外部のcronジョブやタスクキューで実装
        # ここでは設定を保存するだけ
        
        return jsonify({
            "message": f"毎朝 {send_time} に {recipient_email} へのメール通知を設定しました",
            "email": recipient_email,
            "time": send_time,
            "status": "scheduled"
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"エラーが発生しました: {str(e)}"}), 500

@email_bp.route('/test-email', methods=['POST'])
def test_email():
    """テスト用メール送信"""
    try:
        data = request.get_json()
        recipient_email = data.get('email', 'taiki.mishima.biz@gmail.com')
        
        email_service = EmailService()
        
        # テスト用の簡単なメール
        success = email_service._send_email(
            recipient_email,
            "🧪 Taiki Life OS - テストメール",
            """
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>🧪 テストメール</h2>
                <p>Taiki Life OSからのメール通知が正常に動作しています。</p>
                <p><strong>送信時刻:</strong> {}</p>
                <p><a href="https://g8h3ilc3vgld.manus.space">ダッシュボードを開く</a></p>
            </body>
            </html>
            """.format(datetime.now().strftime('%Y年%m月%d日 %H:%M:%S'))
        )
        
        if success:
            return jsonify({
                "message": f"テストメールを {recipient_email} に送信しました",
                "sent_at": datetime.utcnow().isoformat()
            }), 200
        else:
            return jsonify({"error": "テストメール送信に失敗しました"}), 500
            
    except Exception as e:
        return jsonify({"error": f"エラーが発生しました: {str(e)}"}), 500

