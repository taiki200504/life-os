import requests
import json
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
from src.services.notion_service import NotionService

class NotionEnhancedService(NotionService):
    """強化されたNotion連携サービス - 特定のデータベースとの連携に特化"""
    
    # データベースID定数
    DAILY_TASKS_DB_ID = "261e5094-9125-814e-a70d-ecb2a4aa888a"
    WEEKLY_GOALS_DB_ID = "261e5094-9125-811f-848c-fb61437a523f"
    METRICS_DB_ID = "261e5094-9125-812f-8ea6-c2c5736fc36c"
    TASK_MANAGEMENT_DB_ID = "27fe5094-9125-80d2-8db1-fa5067b0b797"
    
    def __init__(self, api_key: str = None):
        super().__init__(api_key)
    
    # ===== Daily Tasks データベース操作 =====
    
    def get_daily_tasks(self, target_date: date = None) -> List[Dict]:
        """指定日の日次タスクを取得"""
        if target_date is None:
            target_date = date.today()
        
        filter_conditions = {
            "property": "Date",
            "date": {
                "equals": target_date.isoformat()
            }
        }
        
        results = self.query_database(self.DAILY_TASKS_DB_ID, filter_conditions)
        return [self._parse_daily_task(result) for result in results]
    
    def create_daily_task(self, name: str, category: str, target_date: date = None, duration: int = None, notes: str = None) -> Optional[str]:
        """新しい日次タスクを作成"""
        if target_date is None:
            target_date = date.today()
        
        properties = {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": name
                        }
                    }
                ]
            },
            "Category": {
                "select": {
                    "name": category
                }
            },
            "Date": {
                "date": {
                    "start": target_date.isoformat()
                }
            },
            "Completed": {
                "checkbox": False
            }
        }
        
        if duration is not None:
            properties["Duration"] = {
                "number": duration
            }
        
        if notes:
            properties["Notes"] = {
                "rich_text": [
                    {
                        "text": {
                            "content": notes
                        }
                    }
                ]
            }
        
        return self.create_page(self.DAILY_TASKS_DB_ID, properties)
    
    def update_daily_task_completion(self, task_id: str, completed: bool) -> bool:
        """日次タスクの完了状態を更新"""
        properties = {
            "Completed": {
                "checkbox": completed
            }
        }
        return self.update_page(task_id, properties)
    
    def initialize_daily_tasks_for_date(self, target_date: date = None) -> List[str]:
        """指定日のTaiki Life OS標準タスクを初期化"""
        if target_date is None:
            target_date = date.today()
        
        # Taiki Life OSの標準6タスク
        standard_tasks = [
            {"name": "静寂10分", "category": "静寂", "duration": 10},
            {"name": "深い仕事1ブロック", "category": "深い仕事", "duration": 60},
            {"name": "身体を動かす", "category": "運動", "duration": 10},
            {"name": "学習15分", "category": "学習", "duration": 15},
            {"name": "感謝/連絡1件", "category": "感謝", "duration": 5},
            {"name": "5分リセット", "category": "リセット", "duration": 5}
        ]
        
        created_task_ids = []
        for task in standard_tasks:
            task_id = self.create_daily_task(
                name=task["name"],
                category=task["category"],
                target_date=target_date,
                duration=task["duration"]
            )
            if task_id:
                created_task_ids.append(task_id)
        
        return created_task_ids
    
    # ===== Weekly Goals データベース操作 =====
    
    def get_weekly_goals(self, week_start: date = None) -> List[Dict]:
        """指定週の週間目標を取得"""
        if week_start is None:
            # 今週の月曜日を計算
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        filter_conditions = {
            "property": "Week",
            "date": {
                "equals": week_start.isoformat()
            }
        }
        
        results = self.query_database(self.WEEKLY_GOALS_DB_ID, filter_conditions)
        return [self._parse_weekly_goal(result) for result in results]
    
    def create_weekly_goal(self, name: str, target: int, unit: str = "回", week_start: date = None) -> Optional[str]:
        """新しい週間目標を作成"""
        if week_start is None:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        properties = {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": name
                        }
                    }
                ]
            },
            "Target": {
                "number": target
            },
            "Current": {
                "number": 0
            },
            "Unit": {
                "rich_text": [
                    {
                        "text": {
                            "content": unit
                        }
                    }
                ]
            },
            "Week": {
                "date": {
                    "start": week_start.isoformat()
                }
            }
        }
        
        return self.create_page(self.WEEKLY_GOALS_DB_ID, properties)
    
    def update_weekly_goal_progress(self, goal_id: str, current: int) -> bool:
        """週間目標の進捗を更新"""
        properties = {
            "Current": {
                "number": current
            }
        }
        return self.update_page(goal_id, properties)
    
    def initialize_weekly_goals_for_week(self, week_start: date = None) -> List[str]:
        """指定週のTaiki Life OS標準週間目標を初期化"""
        if week_start is None:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        # Taiki Life OSの標準週間目標
        standard_goals = [
            {"name": "運動", "target": 4, "unit": "回"},
            {"name": "ふたり時間", "target": 2, "unit": "回"},
            {"name": "部屋リセット", "target": 1, "unit": "回"},
            {"name": "お金＆画面の棚卸し", "target": 1, "unit": "回"},
            {"name": "次週の最重要1つを決定", "target": 1, "unit": "回"}
        ]
        
        created_goal_ids = []
        for goal in standard_goals:
            goal_id = self.create_weekly_goal(
                name=goal["name"],
                target=goal["target"],
                unit=goal["unit"],
                week_start=week_start
            )
            if goal_id:
                created_goal_ids.append(goal_id)
        
        return created_goal_ids
    
    # ===== Metrics データベース操作 =====
    
    def get_metrics(self, target_date: date = None) -> List[Dict]:
        """指定日のメトリクスを取得"""
        if target_date is None:
            target_date = date.today()
        
        filter_conditions = {
            "property": "Date",
            "date": {
                "equals": target_date.isoformat()
            }
        }
        
        results = self.query_database(self.METRICS_DB_ID, filter_conditions)
        return [self._parse_metric(result) for result in results]
    
    def create_metric(self, name: str, score: int, target_date: date = None, completed: bool = False) -> Optional[str]:
        """新しいメトリクスを作成"""
        if target_date is None:
            target_date = date.today()
        
        # 週の開始日を計算
        week_start = target_date - timedelta(days=target_date.weekday())
        
        properties = {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": name
                        }
                    }
                ]
            },
            "Score": {
                "number": score
            },
            "Date": {
                "date": {
                    "start": target_date.isoformat()
                }
            },
            "Week": {
                "date": {
                    "start": week_start.isoformat()
                }
            },
            "Completed": {
                "checkbox": completed
            }
        }
        
        return self.create_page(self.METRICS_DB_ID, properties)
    
    def update_metric_score(self, metric_id: str, score: int, completed: bool = None) -> bool:
        """メトリクスのスコアを更新"""
        properties = {
            "Score": {
                "number": score
            }
        }
        
        if completed is not None:
            properties["Completed"] = {
                "checkbox": completed
            }
        
        return self.update_page(metric_id, properties)
    
    # ===== Task Management データベース操作 =====
    
    def get_task_management_tasks(self, project: str = None, priority: str = None, completed: bool = None) -> List[Dict]:
        """タスク管理データベースからタスクを取得"""
        filter_conditions = None
        
        if project or priority or completed is not None:
            filters = []
            
            if project:
                filters.append({
                    "property": "プロジェクト",
                    "select": {
                        "equals": project
                    }
                })
            
            if priority:
                filters.append({
                    "property": "優先度",
                    "select": {
                        "equals": priority
                    }
                })
            
            if completed is not None:
                filters.append({
                    "property": "完了",
                    "checkbox": {
                        "equals": completed
                    }
                })
            
            if len(filters) > 1:
                filter_conditions = {
                    "and": filters
                }
            elif len(filters) == 1:
                filter_conditions = filters[0]
        
        results = self.query_database(self.TASK_MANAGEMENT_DB_ID, filter_conditions)
        return [self._parse_task_management_task(result) for result in results]
    
    # ===== データパース用ヘルパーメソッド =====
    
    def _parse_daily_task(self, notion_page: Dict) -> Dict:
        """Daily Taskページをパース"""
        props = notion_page["properties"]
        
        return {
            "id": notion_page["id"],
            "name": self._extract_title(props.get("Name", {}).get("title", [])),
            "category": props.get("Category", {}).get("select", {}).get("name") if props.get("Category", {}).get("select") else None,
            "completed": props.get("Completed", {}).get("checkbox", False),
            "date": self._extract_date(props.get("Date", {})),
            "duration": props.get("Duration", {}).get("number"),
            "notes": self._extract_rich_text(props.get("Notes", {}).get("rich_text", [])),
            "created_time": notion_page.get("created_time"),
            "last_edited_time": notion_page.get("last_edited_time")
        }
    
    def _parse_weekly_goal(self, notion_page: Dict) -> Dict:
        """Weekly Goalページをパース"""
        props = notion_page["properties"]
        
        return {
            "id": notion_page["id"],
            "name": self._extract_title(props.get("Name", {}).get("title", [])),
            "current": props.get("Current", {}).get("number", 0),
            "target": props.get("Target", {}).get("number", 0),
            "unit": self._extract_rich_text(props.get("Unit", {}).get("rich_text", [])),
            "week": self._extract_date(props.get("Week", {})),
            "created_time": notion_page.get("created_time"),
            "last_edited_time": notion_page.get("last_edited_time")
        }
    
    def _parse_metric(self, notion_page: Dict) -> Dict:
        """Metricページをパース"""
        props = notion_page["properties"]
        
        return {
            "id": notion_page["id"],
            "name": self._extract_title(props.get("Name", {}).get("title", [])),
            "score": props.get("Score", {}).get("number", 0),
            "date": self._extract_date(props.get("Date", {})),
            "week": self._extract_date(props.get("Week", {})),
            "completed": props.get("Completed", {}).get("checkbox", False),
            "created_time": notion_page.get("created_time"),
            "last_edited_time": notion_page.get("last_edited_time")
        }
    
    def _parse_task_management_task(self, notion_page: Dict) -> Dict:
        """Task Managementページをパース"""
        props = notion_page["properties"]
        
        return {
            "id": notion_page["id"],
            "name": self._extract_title(props.get("タスク名", {}).get("title", [])),
            "completed": props.get("完了", {}).get("checkbox", False),
            "due_date": self._extract_date(props.get("期日", {})),
            "priority": props.get("優先度", {}).get("select", {}).get("name") if props.get("優先度", {}).get("select") else None,
            "project": props.get("プロジェクト", {}).get("select", {}).get("name") if props.get("プロジェクト", {}).get("select") else None,
            "notes": self._extract_rich_text(props.get("メモ", {}).get("rich_text", [])),
            "created_time": notion_page.get("created_time"),
            "last_edited_time": notion_page.get("last_edited_time")
        }
    
    def _extract_title(self, title_array: List[Dict]) -> str:
        """タイトル配列からテキストを抽出"""
        if not title_array:
            return ""
        
        title_parts = []
        for item in title_array:
            if item.get("type") == "text":
                content = item.get("text", {}).get("content", "")
                if content:
                    title_parts.append(content)
        
        return "".join(title_parts)
    
    def _extract_rich_text(self, rich_text_array: List[Dict]) -> str:
        """リッチテキスト配列からテキストを抽出"""
        if not rich_text_array:
            return ""
        
        text_parts = []
        for item in rich_text_array:
            if item.get("type") == "text":
                content = item.get("text", {}).get("content", "")
                if content:
                    text_parts.append(content)
        
        return "".join(text_parts)
    
    def _extract_date(self, date_property: Dict) -> Optional[date]:
        """日付プロパティから日付を抽出"""
        date_info = date_property.get("date")
        if not date_info:
            return None
        
        start_date = date_info.get("start")
        if not start_date:
            return None
        
        try:
            return datetime.fromisoformat(start_date.replace("Z", "+00:00")).date()
        except:
            return None
    
    # ===== 統合操作メソッド =====
    
    def sync_daily_data(self, target_date: date = None) -> Dict:
        """指定日の全データを同期"""
        if target_date is None:
            target_date = date.today()
        
        result = {
            "date": target_date.isoformat(),
            "daily_tasks": self.get_daily_tasks(target_date),
            "metrics": self.get_metrics(target_date),
            "sync_time": datetime.now().isoformat()
        }
        
        return result
    
    def sync_weekly_data(self, week_start: date = None) -> Dict:
        """指定週の全データを同期"""
        if week_start is None:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        result = {
            "week_start": week_start.isoformat(),
            "weekly_goals": self.get_weekly_goals(week_start),
            "sync_time": datetime.now().isoformat()
        }
        
        return result

