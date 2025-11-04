import requests
import json
import os
from datetime import datetime, date
from typing import Dict, List, Optional, Any

class NotionService:
    """Notion APIとの連携を管理するサービスクラス"""
    
    def __init__(self, api_key: str = None):
        if api_key is None:
            api_key = os.getenv('NOTION_API_KEY')
        self.api_key = api_key
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}" if api_key else "",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
    
    def test_connection(self) -> bool:
        """Notion APIへの接続をテスト"""
        try:
            response = requests.get(f"{self.base_url}/users", headers=self.headers)
            return response.status_code == 200
        except Exception:
            return False
    
    def create_database(self, parent_page_id: str, title: str, properties: Dict) -> Optional[str]:
        """新しいデータベースを作成"""
        payload = {
            "parent": {
                "type": "page_id",
                "page_id": parent_page_id
            },
            "title": [
                {
                    "type": "text",
                    "text": {
                        "content": title
                    }
                }
            ],
            "properties": properties
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/databases",
                headers=self.headers,
                json=payload
            )
            if response.status_code == 200:
                return response.json()["id"]
            return None
        except Exception:
            return None
    
    def query_database(self, database_id: str, filter_conditions: Dict = None, sorts: List = None) -> List[Dict]:
        """データベースをクエリ"""
        payload = {}
        if filter_conditions:
            payload["filter"] = filter_conditions
        if sorts:
            payload["sorts"] = sorts
        
        try:
            response = requests.post(
                f"{self.base_url}/databases/{database_id}/query",
                headers=self.headers,
                json=payload
            )
            if response.status_code == 200:
                return response.json()["results"]
            return []
        except Exception:
            return []
    
    def create_page(self, database_id: str, properties: Dict) -> Optional[str]:
        """データベースに新しいページを作成"""
        payload = {
            "parent": {
                "type": "database_id",
                "database_id": database_id
            },
            "properties": properties
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/pages",
                headers=self.headers,
                json=payload
            )
            if response.status_code == 200:
                return response.json()["id"]
            return None
        except Exception:
            return None
    
    def update_page(self, page_id: str, properties: Dict) -> bool:
        """ページのプロパティを更新"""
        payload = {
            "properties": properties
        }
        
        try:
            response = requests.patch(
                f"{self.base_url}/pages/{page_id}",
                headers=self.headers,
                json=payload
            )
            return response.status_code == 200
        except Exception:
            return False
    
    def delete_page(self, page_id: str) -> bool:
        """ページを削除（アーカイブ）"""
        payload = {
            "archived": True
        }
        
        try:
            response = requests.patch(
                f"{self.base_url}/pages/{page_id}",
                headers=self.headers,
                json=payload
            )
            return response.status_code == 200
        except Exception:
            return False
    
    def get_database_schema(self, database_id: str) -> Optional[Dict]:
        """データベースのスキーマを取得"""
        try:
            response = requests.get(
                f"{self.base_url}/databases/{database_id}",
                headers=self.headers
            )
            if response.status_code == 200:
                return response.json()["properties"]
            return None
        except Exception:
            return None

class NotionDataMapper:
    """Notionのデータとローカルモデルのマッピングを管理"""
    
    @staticmethod
    def daily_task_to_notion(task) -> Dict:
        """DailyTaskをNotion形式に変換"""
        return {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": task.name
                        }
                    }
                ]
            },
            "Completed": {
                "checkbox": task.completed
            },
            "Date": {
                "date": {
                    "start": task.date.isoformat()
                }
            },
            "Category": {
                "select": {
                    "name": task.category
                } if task.category else None
            },
            "Duration": {
                "number": task.duration
            } if task.duration else None,
            "Notes": {
                "rich_text": [
                    {
                        "text": {
                            "content": task.notes or ""
                        }
                    }
                ]
            }
        }
    
    @staticmethod
    def notion_to_daily_task(notion_page: Dict) -> Dict:
        """Notion形式をDailyTask用辞書に変換"""
        props = notion_page["properties"]
        
        return {
            "notion_id": notion_page["id"],
            "name": props.get("Name", {}).get("title", [{}])[0].get("text", {}).get("content", ""),
            "completed": props.get("Completed", {}).get("checkbox", False),
            "date": datetime.fromisoformat(props.get("Date", {}).get("date", {}).get("start", "")).date() if props.get("Date", {}).get("date") else None,
            "category": props.get("Category", {}).get("select", {}).get("name") if props.get("Category", {}).get("select") else None,
            "duration": props.get("Duration", {}).get("number"),
            "notes": props.get("Notes", {}).get("rich_text", [{}])[0].get("text", {}).get("content", "") if props.get("Notes", {}).get("rich_text") else None
        }
    
    @staticmethod
    def weekly_goal_to_notion(goal) -> Dict:
        """WeeklyGoalをNotion形式に変換"""
        return {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": goal.name
                        }
                    }
                ]
            },
            "Current": {
                "number": goal.current
            },
            "Target": {
                "number": goal.target
            },
            "Week": {
                "date": {
                    "start": goal.week_start.isoformat()
                }
            },
            "Unit": {
                "select": {
                    "name": goal.unit
                }
            }
        }
    
    @staticmethod
    def notion_to_weekly_goal(notion_page: Dict) -> Dict:
        """Notion形式をWeeklyGoal用辞書に変換"""
        props = notion_page["properties"]
        
        return {
            "notion_id": notion_page["id"],
            "name": props.get("Name", {}).get("title", [{}])[0].get("text", {}).get("content", ""),
            "current": props.get("Current", {}).get("number", 0),
            "target": props.get("Target", {}).get("number", 0),
            "week_start": datetime.fromisoformat(props.get("Week", {}).get("date", {}).get("start", "")).date() if props.get("Week", {}).get("date") else None,
            "unit": props.get("Unit", {}).get("select", {}).get("name", "回") if props.get("Unit", {}).get("select") else "回"
        }

