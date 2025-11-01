"""
Daily Update Service for Taiki Life OS
毎日のシステム更新とNotion連携を管理するサービス
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging
from .notion_service import NotionService

logger = logging.getLogger(__name__)

class DailyUpdateService:
    def __init__(self):
        self.notion_service = NotionService()
        self.last_update_file = 'data/last_update.json'
        
    def should_update_today(self) -> bool:
        """今日更新が必要かどうかを判定"""
        try:
            if not os.path.exists(self.last_update_file):
                return True
                
            with open(self.last_update_file, 'r') as f:
                data = json.load(f)
                last_update = datetime.fromisoformat(data.get('last_update', '2000-01-01'))
                today = datetime.now().date()
                
                return last_update.date() < today
        except Exception as e:
            logger.error(f"Error checking last update: {e}")
            return True
    
    def mark_updated_today(self):
        """今日の更新完了をマーク"""
        try:
            os.makedirs(os.path.dirname(self.last_update_file), exist_ok=True)
            data = {
                'last_update': datetime.now().isoformat(),
                'update_count': self.get_update_count() + 1
            }
            with open(self.last_update_file, 'w') as f:
                json.dump(data, f)
        except Exception as e:
            logger.error(f"Error marking update: {e}")
    
    def get_update_count(self) -> int:
        """更新回数を取得"""
        try:
            if os.path.exists(self.last_update_file):
                with open(self.last_update_file, 'r') as f:
                    data = json.load(f)
                    return data.get('update_count', 0)
        except Exception as e:
            logger.error(f"Error getting update count: {e}")
        return 0
    
    def reset_daily_tasks(self) -> Dict[str, Any]:
        """毎日のタスクをリセット"""
        daily_tasks = [
            {
                "id": "meditation",
                "title": "静寂10分",
                "description": "瞑想/深呼吸/散歩",
                "completed": False,
                "category": "mindfulness",
                "priority": "high"
            },
            {
                "id": "deep_work",
                "title": "深い仕事1ブロック",
                "description": "25-90分",
                "completed": False,
                "category": "work",
                "priority": "high"
            },
            {
                "id": "exercise",
                "title": "身体を動かす",
                "description": "最低10分",
                "completed": False,
                "category": "health",
                "priority": "high"
            },
            {
                "id": "learning",
                "title": "学習15分",
                "description": "英語/コード/読書",
                "completed": False,
                "category": "growth",
                "priority": "medium"
            },
            {
                "id": "gratitude",
                "title": "感謝/連絡1件",
                "description": "人間関係の貯金",
                "completed": False,
                "category": "relationship",
                "priority": "medium"
            },
            {
                "id": "reset",
                "title": "5分リセット",
                "description": "机と床をスッキリ",
                "completed": False,
                "category": "environment",
                "priority": "low"
            }
        ]
        
        return {
            "date": datetime.now().isoformat(),
            "tasks": daily_tasks,
            "metrics": {
                "deep_work": False,
                "exercise": False,
                "learning": False,
                "sns_limit": False,
                "gratitude": False
            }
        }
    
    def get_weekly_goals(self) -> List[Dict[str, Any]]:
        """週次目標を取得"""
        return [
            {
                "id": "exercise_4x",
                "title": "運動×4回",
                "description": "うち2回は心拍が上がる強度",
                "target": 4,
                "current": 0,
                "category": "health"
            },
            {
                "id": "quality_time_2x",
                "title": "ふたり時間×2",
                "description": "各120分",
                "target": 2,
                "current": 0,
                "category": "relationship"
            },
            {
                "id": "room_reset",
                "title": "部屋リセット",
                "description": "30分",
                "target": 1,
                "current": 0,
                "category": "environment"
            },
            {
                "id": "money_review",
                "title": "お金＆画面の棚卸し",
                "description": "15分",
                "target": 1,
                "current": 0,
                "category": "review"
            }
        ]
    
    def sync_with_notion(self) -> Dict[str, Any]:
        """Notionとの同期を実行"""
        try:
            # Notionからタスクデータを取得
            notion_tasks = self.notion_service.get_daily_tasks()
            
            # Notionから週次目標を取得
            notion_goals = self.notion_service.get_weekly_goals()
            
            # メトリクスデータを取得
            notion_metrics = self.notion_service.get_metrics()
            
            return {
                "success": True,
                "tasks": notion_tasks,
                "goals": notion_goals,
                "metrics": notion_metrics,
                "sync_time": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error syncing with Notion: {e}")
            return {
                "success": False,
                "error": str(e),
                "sync_time": datetime.now().isoformat()
            }
    
    def perform_daily_update(self) -> Dict[str, Any]:
        """日次更新を実行"""
        try:
            logger.info("Starting daily update...")
            
            # 1. 日次タスクをリセット
            daily_data = self.reset_daily_tasks()
            
            # 2. 週次目標を更新
            weekly_goals = self.get_weekly_goals()
            
            # 3. Notionと同期
            notion_sync = self.sync_with_notion()
            
            # 4. 更新完了をマーク
            self.mark_updated_today()
            
            result = {
                "success": True,
                "update_time": datetime.now().isoformat(),
                "daily_tasks": daily_data,
                "weekly_goals": weekly_goals,
                "notion_sync": notion_sync,
                "update_count": self.get_update_count()
            }
            
            logger.info("Daily update completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error performing daily update: {e}")
            return {
                "success": False,
                "error": str(e),
                "update_time": datetime.now().isoformat()
            }
    
    def get_system_status(self) -> Dict[str, Any]:
        """システムの状態を取得"""
        try:
            needs_update = self.should_update_today()
            
            last_update_data = {}
            if os.path.exists(self.last_update_file):
                with open(self.last_update_file, 'r') as f:
                    last_update_data = json.load(f)
            
            return {
                "needs_update": needs_update,
                "last_update": last_update_data.get('last_update'),
                "update_count": last_update_data.get('update_count', 0),
                "current_time": datetime.now().isoformat(),
                "notion_connected": self.notion_service.test_connection()
            }
        except Exception as e:
            logger.error(f"Error getting system status: {e}")
            return {
                "needs_update": True,
                "error": str(e),
                "current_time": datetime.now().isoformat()
            }

