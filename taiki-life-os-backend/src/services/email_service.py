import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, date, timedelta
import os
from typing import Dict, List, Optional
from src.models.notion_models import DailyTask, WeeklyGoal, Metric, NotionConfig
from src.models.user import db

class EmailService:
    """メール通知サービス"""
    
    def __init__(self):
        # Gmail SMTP設定
        self.smtp_server = "smtp.gmail.com"
        self.port = 587
        # 環境変数から取得（本番環境では設定が必要）
        self.sender_email = os.getenv('SENDER_EMAIL', 'noreply@taikimishima.com')
        self.sender_password = os.getenv('SENDER_PASSWORD', '')
        
    def send_daily_summary(self, recipient_email: str) -> bool:
        """毎朝の日次サマリーメールを送信"""
        try:
            # 今日のデータを取得
            today = date.today()
            yesterday = today - timedelta(days=1)
            
            # 昨日のタスク完了状況
            yesterday_tasks = DailyTask.query.filter_by(date=yesterday).all()
            completed_tasks = [task for task in yesterday_tasks if task.completed]
            
            # 今週の目標進捗
            week_start = today - timedelta(days=today.weekday())
            weekly_goals = WeeklyGoal.query.filter_by(week_start=week_start).all()
            
            # 今週のメトリクス
            week_metrics = Metric.query.filter(
                Metric.week_start == week_start
            ).all()
            
            # メール内容を生成
            subject = f"🌅 Taiki Life OS - 今日の目標 ({today.strftime('%Y年%m月%d日')})"
            html_content = self._generate_daily_email_html(
                today, yesterday_tasks, completed_tasks, weekly_goals, week_metrics
            )
            
            # メール送信
            return self._send_email(recipient_email, subject, html_content)
            
        except Exception as e:
            print(f"メール送信エラー: {str(e)}")
            return False
    
    def _generate_daily_email_html(self, today: date, yesterday_tasks: List[DailyTask], 
                                 completed_tasks: List[DailyTask], weekly_goals: List[WeeklyGoal],
                                 week_metrics: List[Metric]) -> str:
        """日次メールのHTML内容を生成"""
        
        # 昨日の完了率計算
        completion_rate = (len(completed_tasks) / len(yesterday_tasks) * 100) if yesterday_tasks else 0
        
        # 今週のスコア計算
        weekly_score = sum(1 for metric in week_metrics if metric.completed)
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
                .header p {{ margin: 10px 0 0 0; opacity: 0.9; }}
                .content {{ padding: 30px 20px; }}
                .section {{ margin-bottom: 30px; }}
                .section h2 {{ color: #333; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }}
                .task-list {{ list-style: none; padding: 0; }}
                .task-item {{ background: #f8f9fa; margin: 8px 0; padding: 12px 15px; border-radius: 8px; border-left: 4px solid #667eea; }}
                .task-completed {{ border-left-color: #28a745; background: #d4edda; }}
                .progress-bar {{ background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }}
                .progress-fill {{ background: linear-gradient(90deg, #28a745, #20c997); height: 100%; transition: width 0.3s ease; }}
                .stats {{ display: flex; justify-content: space-around; margin: 20px 0; }}
                .stat {{ text-align: center; }}
                .stat-number {{ font-size: 24px; font-weight: bold; color: #667eea; }}
                .stat-label {{ font-size: 12px; color: #666; text-transform: uppercase; }}
                .footer {{ background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }}
                .cta-button {{ display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌅 Taiki Life OS</h1>
                    <p>{today.strftime('%Y年%m月%d日')} - 今日も最高の一日にしよう！</p>
                </div>
                
                <div class="content">
                    <div class="section">
                        <h2>📊 昨日の振り返り</h2>
                        <div class="stats">
                            <div class="stat">
                                <div class="stat-number">{len(completed_tasks)}/{len(yesterday_tasks) if yesterday_tasks else 0}</div>
                                <div class="stat-label">タスク完了</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">{completion_rate:.0f}%</div>
                                <div class="stat-label">完了率</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">{weekly_score}/35</div>
                                <div class="stat-label">週間スコア</div>
                            </div>
                        </div>
                        
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: {completion_rate}%"></div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>🎯 今日の目標</h2>
                        <ul class="task-list">
                            <li class="task-item">🧘 静寂10分（瞑想/深呼吸/散歩）</li>
                            <li class="task-item">🎯 深い仕事1ブロック（25-90分）</li>
                            <li class="task-item">🏃 身体を動かす（最低10分）</li>
                            <li class="task-item">📚 学習15分（英語/コード/読書）</li>
                            <li class="task-item">💝 感謝/連絡1件</li>
                            <li class="task-item">🧹 5分リセット（机と床をスッキリ）</li>
                        </ul>
                    </div>
                    
                    <div class="section">
                        <h2>📈 今週の目標進捗</h2>
        """
        
        # 週間目標の進捗を追加
        for goal in weekly_goals:
            progress_percent = (goal.current / goal.target * 100) if goal.target > 0 else 0
            html += f"""
                        <div style="margin: 15px 0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>{goal.name}</span>
                                <span>{goal.current}/{goal.target} {goal.unit}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: {min(progress_percent, 100)}%"></div>
                            </div>
                        </div>
            """
        
        html += f"""
                    </div>
                    
                    <div class="section">
                        <h2>💡 今日の一点集中</h2>
                        <p style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <strong>その日いちばん大事な1つ</strong>を午前中に前倒しで終わらせましょう。<br>
                            迷い＝ノイズ。環境設計で勝つ。意思で戦わない。
                        </p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="https://g8h3ilc3vgld.manus.space" class="cta-button">
                            📱 ダッシュボードを開く
                        </a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>🚀 Taiki Life OS - Noise-Free Edition</p>
                    <p>継続は力なり。今日も一歩ずつ前進しましょう！</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html
    
    def _send_email(self, recipient_email: str, subject: str, html_content: str) -> bool:
        """実際にメールを送信"""
        try:
            # MIMEメッセージを作成
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            # HTMLパートを追加
            html_part = MIMEText(html_content, "html", "utf-8")
            message.attach(html_part)
            
            # Gmail SMTPサーバーに接続してメール送信
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.port) as server:
                server.starttls(context=context)
                # 本番環境では適切な認証情報を設定
                if self.sender_password:
                    server.login(self.sender_email, self.sender_password)
                
                # メール送信（開発環境では実際には送信しない）
                if os.getenv('ENVIRONMENT') == 'production':
                    server.sendmail(self.sender_email, recipient_email, message.as_string())
                else:
                    print(f"[開発環境] メール送信をシミュレート: {recipient_email}")
                    print(f"件名: {subject}")
                    return True
            
            return True
            
        except Exception as e:
            print(f"メール送信エラー: {str(e)}")
            return False
    
    def send_weekly_summary(self, recipient_email: str) -> bool:
        """週次サマリーメールを送信"""
        try:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
            
            # 今週のメトリクス
            week_metrics = Metric.query.filter(
                Metric.week_start == week_start
            ).all()
            
            weekly_score = sum(1 for metric in week_metrics if metric.completed)
            
            subject = f"📊 Taiki Life OS - 週間レポート ({week_start.strftime('%m/%d')}週)"
            
            # 簡単な週間レポートHTML
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; margin: 20px;">
                <h2>📊 週間レポート</h2>
                <p><strong>週間スコア:</strong> {weekly_score}/35</p>
                <p><strong>評価:</strong> {'🎉 良い週！' if weekly_score >= 20 else '💪 来週頑張ろう'}</p>
                
                <h3>📈 今週の実績</h3>
                <ul>
            """
            
            # メトリクス詳細を追加
            metric_names = ["深い仕事1ブロック", "運動(10分以上)", "学習(15分以上)", "SNS45分以内", "感謝1回"]
            for i, name in enumerate(metric_names):
                completed_days = len([m for m in week_metrics if m.name == name and m.completed])
                html_content += f"<li>{name}: {completed_days}/7日</li>"
            
            html_content += """
                </ul>
                
                <p><a href="https://g8h3ilc3vgld.manus.space">ダッシュボードを確認</a></p>
            </body>
            </html>
            """
            
            return self._send_email(recipient_email, subject, html_content)
            
        except Exception as e:
            print(f"週間レポート送信エラー: {str(e)}")
            return False

