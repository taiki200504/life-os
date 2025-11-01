"""
Automation Service - 自動化とバッチ処理を管理
"""
import os
from datetime import datetime, timedelta
from src.models.user import db, Task, Session, DailyReview, TaskStatus, User
from src.services.notion_sync_service import NotionSyncService
import schedule
import time
import threading

class AutomationService:
    def __init__(self):
        self.notion_sync = NotionSyncService()
        self.is_running = False
        self.thread = None
    
    def start_scheduler(self):
        """スケジューラーを開始"""
        if self.is_running:
            print('Scheduler is already running')
            return
        
        self.is_running = True
        
        # 定期同期（5分ごと）
        schedule.every(5).minutes.do(self.sync_with_notion)
        
        # 日次処理（毎日0時）
        schedule.every().day.at('00:00').do(self.daily_tasks)
        
        # 翌日ブロック生成（毎日23:00）
        schedule.every().day.at('23:00').do(self.generate_next_day_block)
        
        # スケジューラーをバックグラウンドで実行
        self.thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.thread.start()
        
        print('Automation scheduler started')
    
    def stop_scheduler(self):
        """スケジューラーを停止"""
        self.is_running = False
        schedule.clear()
        print('Automation scheduler stopped')
    
    def _run_scheduler(self):
        """スケジューラーのメインループ"""
        while self.is_running:
            schedule.run_pending()
            time.sleep(60)  # 1分ごとにチェック
    
    # ========== 定期同期 ==========
    
    def sync_with_notion(self):
        """Notionとの定期同期"""
        try:
            print(f'[{datetime.now().isoformat()}] Starting Notion sync...')
            results = self.notion_sync.sync_all()
            print(f'[{datetime.now().isoformat()}] Notion sync completed: {results}')
            return results
        except Exception as e:
            print(f'[{datetime.now().isoformat()}] Notion sync failed: {e}')
            return {'error': str(e)}
    
    # ========== 日次処理 ==========
    
    def daily_tasks(self):
        """毎日0時に実行される処理"""
        try:
            print(f'[{datetime.now().isoformat()}] Starting daily tasks...')
            
            # 1. 前日のDONEタスクをアーカイブ（オプション）
            # self.archive_done_tasks()
            
            # 2. TODAYタスクをINBOXに戻す（オプション）
            # self.reset_today_tasks()
            
            # 3. Notionと同期
            self.sync_with_notion()
            
            # 4. KPIを再計算（キャッシュクリア）
            # self.recalculate_kpi()
            
            print(f'[{datetime.now().isoformat()}] Daily tasks completed')
            return {'success': True}
        except Exception as e:
            print(f'[{datetime.now().isoformat()}] Daily tasks failed: {e}')
            return {'error': str(e)}
    
    def archive_done_tasks(self):
        """完了したタスクをアーカイブ"""
        yesterday = (datetime.now() - timedelta(days=1)).date()
        
        # 前日以前に完了したタスクを取得
        done_tasks = Task.query.filter(
            Task.status == TaskStatus.DONE,
            db.func.date(Task.updated_at) <= yesterday
        ).all()
        
        for task in done_tasks:
            # Notionでアーカイブ
            if task.notion_id:
                self.notion_sync.archive_page(task.notion_id)
            
            # データベースから削除（またはアーカイブフラグを立てる）
            db.session.delete(task)
        
        db.session.commit()
        print(f'Archived {len(done_tasks)} done tasks')
    
    def reset_today_tasks(self):
        """TODAYタスクをINBOXに戻す"""
        today_tasks = Task.query.filter_by(status=TaskStatus.TODAY).all()
        
        for task in today_tasks:
            task.status = TaskStatus.INBOX
            task.updated_at = datetime.utcnow()
        
        db.session.commit()
        print(f'Reset {len(today_tasks)} today tasks to inbox')
    
    # ========== 翌日ブロック生成 ==========
    
    def generate_next_day_block(self):
        """翌日のブロックを生成"""
        try:
            print(f'[{datetime.now().isoformat()}] Generating next day block...')
            
            tomorrow = (datetime.now() + timedelta(days=1)).date()
            
            # 1. 翌日のレビューテンプレートを作成（オプション）
            # self.create_review_template(tomorrow)
            
            # 2. ルーティンタスクを生成（オプション）
            # self.create_routine_tasks(tomorrow)
            
            # 3. Notionと同期
            self.sync_with_notion()
            
            print(f'[{datetime.now().isoformat()}] Next day block generated')
            return {'success': True, 'date': tomorrow.isoformat()}
        except Exception as e:
            print(f'[{datetime.now().isoformat()}] Next day block generation failed: {e}')
            return {'error': str(e)}
    
    def create_routine_tasks(self, date):
        """ルーティンタスクを生成"""
        # ルーティンタスクのテンプレート
        routine_templates = [
            {'title': 'Morning Routine', 'area': 'Personal', 'impact': 5, 'effort': 2},
            {'title': 'Exercise', 'area': 'Personal', 'impact': 4, 'effort': 3},
            {'title': 'Daily Review', 'area': 'Personal', 'impact': 5, 'effort': 2},
        ]
        
        # デフォルトユーザーを取得
        user = User.query.first()
        if not user:
            print('No user found, skipping routine tasks')
            return
        
        for template in routine_templates:
            task = Task(
                user_id=user.id,
                title=f"{template['title']} - {date.strftime('%Y-%m-%d')}",
                status=TaskStatus.INBOX,
                area=template.get('area'),
                impact=template.get('impact'),
                effort=template.get('effort'),
                deadline=date
            )
            db.session.add(task)
        
        db.session.commit()
        print(f'Created {len(routine_templates)} routine tasks for {date}')


# グローバルインスタンス
automation_service = AutomationService()
