import os
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class NotionSyncService:
    def __init__(self):
        self.api_key = os.environ.get('NOTION_API_KEY')
        self.parent_page_id = os.environ.get('NOTION_PARENT_PAGE_ID')
        
        if not self.api_key:
            raise ValueError("NOTION_API_KEY environment variable is required")
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        self.database_ids = {}
        
    def create_database(self, title: str, properties: Dict) -> Optional[str]:
        """Notionデータベースを作成"""
        try:
            data = {
                "parent": {"page_id": self.parent_page_id},
                "title": [{"type": "text", "text": {"content": title}}],
                "properties": properties
            }
            
            response = requests.post(
                f"{self.base_url}/databases",
                headers=self.headers,
                json=data
            )
            
            if response.status_code == 200:
                database = response.json()
                return database['id']
            else:
                print(f"Database creation failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Error creating database: {e}")
            return None
    
    def setup_life_os_databases(self) -> Dict[str, str]:
        """Life OS用のデータベースをセットアップ"""
        databases = {}
        
        # 日次タスクデータベース
        daily_tasks_properties = {
            "タスク名": {"title": {}},
            "完了": {"checkbox": {}},
            "日付": {"date": {}},
            "カテゴリ": {
                "select": {
                    "options": [
                        {"name": "静寂", "color": "blue"},
                        {"name": "深い仕事", "color": "purple"},
                        {"name": "運動", "color": "green"},
                        {"name": "学習", "color": "orange"},
                        {"name": "感謝", "color": "red"},
                        {"name": "リセット", "color": "gray"}
                    ]
                }
            }
        }
        
        daily_db_id = self.create_database("Life OS - 日次タスク", daily_tasks_properties)
        if daily_db_id:
            databases['daily_tasks'] = daily_db_id
        
        # 週次目標データベース
        weekly_goals_properties = {
            "目標名": {"title": {}},
            "現在値": {"number": {}},
            "目標値": {"number": {}},
            "週": {"date": {}},
            "達成率": {"formula": {"expression": "prop(\"現在値\") / prop(\"目標値\") * 100"}}
        }
        
        weekly_db_id = self.create_database("Life OS - 週次目標", weekly_goals_properties)
        if weekly_db_id:
            databases['weekly_goals'] = weekly_db_id
        
        # メトリクスデータベース
        metrics_properties = {
            "メトリクス名": {"title": {}},
            "日付": {"date": {}},
            "完了": {"checkbox": {}},
            "週": {"formula": {"expression": "formatDate(prop(\"日付\"), \"YYYY-[W]WW\")"}}
        }
        
        metrics_db_id = self.create_database("Life OS - メトリクス", metrics_properties)
        if metrics_db_id:
            databases['metrics'] = metrics_db_id
        
        self.database_ids = databases
        return databases
    
    def sync_daily_tasks(self, tasks: List[Dict]) -> bool:
        """日次タスクをNotionに同期"""
        if 'daily_tasks' not in self.database_ids:
            return False
            
        try:
            today = datetime.now().strftime("%Y-%m-%d")
            
            for task in tasks:
                # 既存のタスクをチェック
                existing = self.find_task_by_name_and_date(
                    self.database_ids['daily_tasks'], 
                    task['text'], 
                    today
                )
                
                if existing:
                    # 更新
                    self.update_task(existing['id'], task['completed'])
                else:
                    # 新規作成
                    self.create_task(
                        self.database_ids['daily_tasks'],
                        task['text'],
                        task['completed'],
                        today,
                        self.get_task_category(task['text'])
                    )
            
            return True
            
        except Exception as e:
            print(f"Error syncing daily tasks: {e}")
            return False
    
    def sync_weekly_goals(self, goals: List[Dict]) -> bool:
        """週次目標をNotionに同期"""
        if 'weekly_goals' not in self.database_ids:
            return False
            
        try:
            # 今週の月曜日を取得
            today = datetime.now()
            monday = today - timedelta(days=today.weekday())
            week_start = monday.strftime("%Y-%m-%d")
            
            for goal in goals:
                # 既存の目標をチェック
                existing = self.find_goal_by_name_and_week(
                    self.database_ids['weekly_goals'],
                    goal['text'],
                    week_start
                )
                
                if existing:
                    # 更新
                    self.update_goal(existing['id'], goal['current'], goal['target'])
                else:
                    # 新規作成
                    self.create_goal(
                        self.database_ids['weekly_goals'],
                        goal['text'],
                        goal['current'],
                        goal['target'],
                        week_start
                    )
            
            return True
            
        except Exception as e:
            print(f"Error syncing weekly goals: {e}")
            return False
    
    def find_task_by_name_and_date(self, database_id: str, task_name: str, date: str) -> Optional[Dict]:
        """タスク名と日付でタスクを検索"""
        try:
            filter_data = {
                "and": [
                    {
                        "property": "タスク名",
                        "title": {"equals": task_name}
                    },
                    {
                        "property": "日付",
                        "date": {"equals": date}
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/databases/{database_id}/query",
                headers=self.headers,
                json={"filter": filter_data}
            )
            
            if response.status_code == 200:
                results = response.json()['results']
                return results[0] if results else None
            
            return None
            
        except Exception as e:
            print(f"Error finding task: {e}")
            return None
    
    def find_goal_by_name_and_week(self, database_id: str, goal_name: str, week_start: str) -> Optional[Dict]:
        """目標名と週でゴールを検索"""
        try:
            filter_data = {
                "and": [
                    {
                        "property": "目標名",
                        "title": {"equals": goal_name}
                    },
                    {
                        "property": "週",
                        "date": {"equals": week_start}
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/databases/{database_id}/query",
                headers=self.headers,
                json={"filter": filter_data}
            )
            
            if response.status_code == 200:
                results = response.json()['results']
                return results[0] if results else None
            
            return None
            
        except Exception as e:
            print(f"Error finding goal: {e}")
            return None
    
    def create_task(self, database_id: str, task_name: str, completed: bool, date: str, category: str):
        """新しいタスクを作成"""
        try:
            data = {
                "parent": {"database_id": database_id},
                "properties": {
                    "タスク名": {"title": [{"text": {"content": task_name}}]},
                    "完了": {"checkbox": completed},
                    "日付": {"date": {"start": date}},
                    "カテゴリ": {"select": {"name": category}}
                }
            }
            
            response = requests.post(
                f"{self.base_url}/pages",
                headers=self.headers,
                json=data
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error creating task: {e}")
            return False
    
    def create_goal(self, database_id: str, goal_name: str, current: int, target: int, week_start: str):
        """新しい目標を作成"""
        try:
            data = {
                "parent": {"database_id": database_id},
                "properties": {
                    "目標名": {"title": [{"text": {"content": goal_name}}]},
                    "現在値": {"number": current},
                    "目標値": {"number": target},
                    "週": {"date": {"start": week_start}}
                }
            }
            
            response = requests.post(
                f"{self.base_url}/pages",
                headers=self.headers,
                json=data
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error creating goal: {e}")
            return False
    
    def update_task(self, page_id: str, completed: bool):
        """タスクの完了状態を更新"""
        try:
            data = {
                "properties": {
                    "完了": {"checkbox": completed}
                }
            }
            
            response = requests.patch(
                f"{self.base_url}/pages/{page_id}",
                headers=self.headers,
                json=data
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error updating task: {e}")
            return False
    
    def update_goal(self, page_id: str, current: int, target: int):
        """目標の進捗を更新"""
        try:
            data = {
                "properties": {
                    "現在値": {"number": current},
                    "目標値": {"number": target}
                }
            }
            
            response = requests.patch(
                f"{self.base_url}/pages/{page_id}",
                headers=self.headers,
                json=data
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error updating goal: {e}")
            return False
    
    def get_task_category(self, task_text: str) -> str:
        """タスクテキストからカテゴリを判定"""
        if "静寂" in task_text or "瞑想" in task_text:
            return "静寂"
        elif "深い仕事" in task_text or "仕事" in task_text:
            return "深い仕事"
        elif "身体" in task_text or "運動" in task_text:
            return "運動"
        elif "学習" in task_text or "英語" in task_text or "コード" in task_text:
            return "学習"
        elif "感謝" in task_text or "連絡" in task_text:
            return "感謝"
        elif "リセット" in task_text or "片付け" in task_text:
            return "リセット"
        else:
            return "その他"
    
    def test_connection(self) -> bool:
        """Notion API接続をテスト"""
        try:
            response = requests.get(
                f"{self.base_url}/users/me",
                headers=self.headers
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Connection test failed: {e}")
            return False

