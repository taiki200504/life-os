"""
統合Notionサービス - Taiki Task、Weekly Goals、人生計画、LIFEルールの統合管理
"""
import os
import requests
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
from src.services.notion_service import NotionService

class NotionUnifiedService(NotionService):
    """統合Notionサービス - 複数データベースの統合管理"""
    
    def __init__(self, api_key: str = None):
        super().__init__(api_key)
        self._database_cache = {}  # データベースIDのキャッシュ
    
    def find_database_by_name(self, database_name: str) -> Optional[str]:
        """データベース名でデータベースIDを検索"""
        if database_name in self._database_cache:
            return self._database_cache[database_name]
        
        try:
            # Notion検索APIでデータベースを検索
            response = requests.post(
                f"{self.base_url}/search",
                headers=self.headers,
                json={
                    "filter": {
                        "value": "database",
                        "property": "object"
                    },
                    "query": database_name
                }
            )
            
            if response.status_code == 200:
                results = response.json().get("results", [])
                for result in results:
                    title = self._extract_database_title(result)
                    if database_name.lower() in title.lower() or title.lower() in database_name.lower():
                        db_id = result["id"]
                        self._database_cache[database_name] = db_id
                        return db_id
            return None
        except Exception as e:
            print(f"Error finding database {database_name}: {e}")
            return None
    
    def _extract_database_title(self, database: Dict) -> str:
        """データベースからタイトルを抽出"""
        title_array = database.get("title", [])
        if title_array and len(title_array) > 0:
            return title_array[0].get("text", {}).get("content", "")
        return ""
    
    # ===== Taiki Task データベース操作 =====
    
    def get_taiki_tasks(self, target_date: date = None) -> List[Dict]:
        """Taiki Taskデータベースからタスクを取得"""
        if target_date is None:
            target_date = date.today()
        
        db_id = self.find_database_by_name("Taiki Task")
        if not db_id:
            return []
        
        filter_conditions = {
            "property": "Date",
            "date": {
                "equals": target_date.isoformat()
            }
        }
        
        results = self.query_database(db_id, filter_conditions)
        return [self._parse_task(result) for result in results]
    
    def create_taiki_task(self, name: str, completed: bool = False, target_date: date = None, category: str = None) -> Optional[str]:
        """Taiki Taskデータベースにタスクを作成"""
        if target_date is None:
            target_date = date.today()
        
        db_id = self.find_database_by_name("Taiki Task")
        if not db_id:
            return None
        
        properties = {
            "Name": {
                "title": [{"text": {"content": name}}]
            },
            "Completed": {
                "checkbox": completed
            },
            "Date": {
                "date": {"start": target_date.isoformat()}
            }
        }
        
        if category:
            properties["Category"] = {
                "select": {"name": category}
            }
        
        return self.create_page(db_id, properties)
    
    def update_taiki_task(self, task_id: str, properties: Dict) -> bool:
        """Taiki Taskを更新"""
        return self.update_page(task_id, properties)
    
    def delete_taiki_task(self, task_id: str) -> bool:
        """Taiki Taskを削除"""
        return self.delete_page(task_id)
    
    def sync_taiki_tasks(self, tasks: List[Dict]) -> Dict:
        """Taiki Taskを双方向同期"""
        db_id = self.find_database_by_name("Taiki Task")
        if not db_id:
            return {"success": False, "error": "Taiki Taskデータベースが見つかりません"}
        
        today = date.today()
        result = {"created": 0, "updated": 0, "errors": []}
        
        # Notionから今日のタスクを取得
        notion_tasks = self.get_taiki_tasks(today)
        notion_task_map = {task.get("notion_id"): task for task in notion_tasks}
        
        # ローカルタスクをNotionに同期
        for task in tasks:
            notion_id = task.get("notion_id")
            
            if notion_id and notion_id in notion_task_map:
                # 既存タスクを更新
                update_props = {
                    "Name": {
                        "title": [{"text": {"content": task.get("text", task.get("name", ""))}}]
                    },
                    "Completed": {
                        "checkbox": task.get("completed", False)
                    }
                }
                
                if self.update_taiki_task(notion_id, update_props):
                    result["updated"] += 1
                else:
                    result["errors"].append(f"Failed to update task {notion_id}")
            else:
                # 新規タスクを作成
                category = self._infer_category(task.get("text", ""))
                task_id = self.create_taiki_task(
                    name=task.get("text", task.get("name", "")),
                    completed=task.get("completed", False),
                    target_date=today,
                    category=category
                )
                if task_id:
                    result["created"] += 1
                    task["notion_id"] = task_id
                else:
                    result["errors"].append(f"Failed to create task: {task.get('text')}")
        
        return {"success": True, **result}
    
    def _infer_category(self, task_text: str) -> str:
        """タスクテキストからカテゴリを推測"""
        text_lower = task_text.lower()
        if "静寂" in text_lower or "瞑想" in text_lower:
            return "静寂"
        elif "深い仕事" in text_lower or "仕事" in text_lower:
            return "深い仕事"
        elif "身体" in text_lower or "運動" in text_lower:
            return "運動"
        elif "学習" in text_lower or "英語" in text_lower or "コード" in text_lower:
            return "学習"
        elif "感謝" in text_lower or "連絡" in text_lower:
            return "感謝"
        elif "リセット" in text_lower or "片付け" in text_lower:
            return "リセット"
        return "その他"
    
    def _parse_task(self, notion_page: Dict) -> Dict:
        """Notionページをタスク辞書に変換"""
        props = notion_page.get("properties", {})
        
        # タイトルを取得
        name = ""
        title_prop = props.get("Name") or props.get("Title") or props.get("タスク名")
        if title_prop:
            title_array = title_prop.get("title", [])
            if title_array:
                name = title_array[0].get("text", {}).get("content", "")
        
        # 完了状態を取得
        completed = False
        completed_prop = props.get("Completed") or props.get("完了")
        if completed_prop:
            completed = completed_prop.get("checkbox", False)
        
        # 日付を取得
        task_date = date.today()
        date_prop = props.get("Date") or props.get("日付")
        if date_prop and date_prop.get("date"):
            try:
                task_date = datetime.fromisoformat(date_prop["date"]["start"]).date()
            except:
                pass
        
        # カテゴリを取得
        category = None
        category_prop = props.get("Category") or props.get("カテゴリ")
        if category_prop and category_prop.get("select"):
            category = category_prop["select"].get("name")
        
        return {
            "notion_id": notion_page.get("id"),
            "name": name,
            "title": name,  # 互換性のため
            "completed": completed,
            "date": task_date.isoformat(),
            "category": category
        }
    
    # ===== Weekly Goals データベース操作 =====
    
    def get_weekly_goals(self, week_start: date = None) -> List[Dict]:
        """Weekly Goalsデータベースから目標を取得"""
        if week_start is None:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        db_id = self.find_database_by_name("Weekly Goals")
        if not db_id:
            return []
        
        filter_conditions = {
            "property": "Week",
            "date": {
                "equals": week_start.isoformat()
            }
        }
        
        results = self.query_database(db_id, filter_conditions)
        return [self._parse_weekly_goal(result) for result in results]
    
    def sync_weekly_goals(self, goals: List[Dict]) -> Dict:
        """Weekly Goalsを双方向同期"""
        db_id = self.find_database_by_name("Weekly Goals")
        if not db_id:
            return {"success": False, "error": "Weekly Goalsデータベースが見つかりません"}
        
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        result = {"created": 0, "updated": 0, "errors": []}
        
        # Notionから今週の目標を取得
        notion_goals = self.get_weekly_goals(week_start)
        notion_goal_map = {goal.get("notion_id"): goal for goal in notion_goals}
        
        # ローカル目標をNotionに同期
        for goal in goals:
            notion_id = goal.get("notion_id")
            
            if notion_id and notion_id in notion_goal_map:
                # 既存目標を更新
                update_props = {
                    "Name": {
                        "title": [{"text": {"content": goal.get("text", goal.get("name", ""))}}]
                    },
                    "Current": {
                        "number": goal.get("current", 0)
                    },
                    "Target": {
                        "number": goal.get("target", 0)
                    }
                }
                
                if self.update_page(notion_id, update_props):
                    result["updated"] += 1
                else:
                    result["errors"].append(f"Failed to update goal {notion_id}")
            else:
                # 新規目標を作成
                goal_id = self.create_weekly_goal(
                    name=goal.get("text", goal.get("name", "")),
                    current=goal.get("current", 0),
                    target=goal.get("target", 0),
                    unit=goal.get("unit", "回"),
                    week_start=week_start
                )
                if goal_id:
                    result["created"] += 1
                    goal["notion_id"] = goal_id
                else:
                    result["errors"].append(f"Failed to create goal: {goal.get('text')}")
        
        return {"success": True, **result}
    
    def create_weekly_goal(self, name: str, current: int, target: int, unit: str = "回", week_start: date = None) -> Optional[str]:
        """Weekly Goalsに目標を作成"""
        if week_start is None:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        
        db_id = self.find_database_by_name("Weekly Goals")
        if not db_id:
            return None
        
        properties = {
            "Name": {
                "title": [{"text": {"content": name}}]
            },
            "Current": {
                "number": current
            },
            "Target": {
                "number": target
            },
            "Week": {
                "date": {"start": week_start.isoformat()}
            },
            "Unit": {
                "select": {"name": unit}
            }
        }
        
        return self.create_page(db_id, properties)
    
    def _parse_weekly_goal(self, notion_page: Dict) -> Dict:
        """Notionページを週次目標辞書に変換"""
        props = notion_page.get("properties", {})
        
        name = ""
        name_prop = props.get("Name") or props.get("目標名")
        if name_prop:
            name_array = name_prop.get("title", [])
            if name_array:
                name = name_array[0].get("text", {}).get("content", "")
        
        current = props.get("Current", {}).get("number", 0) or props.get("現在値", {}).get("number", 0)
        target = props.get("Target", {}).get("number", 0) or props.get("目標値", {}).get("number", 0)
        unit = "回"
        unit_prop = props.get("Unit") or props.get("単位")
        if unit_prop and unit_prop.get("select"):
            unit = unit_prop["select"].get("name", "回")
        
        week_start = date.today()
        week_prop = props.get("Week") or props.get("週")
        if week_prop and week_prop.get("date"):
            try:
                week_start = datetime.fromisoformat(week_prop["date"]["start"]).date()
            except:
                pass
        
        return {
            "notion_id": notion_page.get("id"),
            "name": name,
            "current": current,
            "target": target,
            "unit": unit,
            "week_start": week_start.isoformat()
        }
    
    # ===== 人生計画 データベース操作 =====
    
    def get_life_plan(self) -> Optional[Dict]:
        """人生計画データベースからデータを取得"""
        db_id = self.find_database_by_name("人生計画")
        if not db_id:
            return None
        
        # 最新のエントリを取得（または特定のID）
        results = self.query_database(db_id, sorts=[{
            "property": "Created",
            "direction": "descending"
        }])
        
        if results:
            return self._parse_life_plan(results[0])
        return None
    
    def update_life_plan(self, life_plan_data: Dict) -> bool:
        """人生計画を更新"""
        db_id = self.find_database_by_name("人生計画")
        if not db_id:
            return False
        
        # 既存のエントリを取得
        results = self.query_database(db_id)
        if not results:
            # 新規作成
            return self.create_life_plan_entry(life_plan_data) is not None
        else:
            # 既存を更新
            page_id = results[0].get("id")
            properties = self._life_plan_to_notion_properties(life_plan_data)
            return self.update_page(page_id, properties)
    
    def create_life_plan_entry(self, life_plan_data: Dict) -> Optional[str]:
        """人生計画エントリを作成"""
        db_id = self.find_database_by_name("人生計画")
        if not db_id:
            return None
        
        properties = self._life_plan_to_notion_properties(life_plan_data)
        return self.create_page(db_id, properties)
    
    def _life_plan_to_notion_properties(self, data: Dict) -> Dict:
        """人生計画データをNotionプロパティに変換"""
        properties = {}
        
        # 各セクションをJSON文字列として保存（または個別プロパティに）
        if "selfPhilosophy" in data:
            properties["自己哲学"] = {
                "rich_text": [{"text": {"content": str(data["selfPhilosophy"])}}]
            }
        
        if "workPhilosophy" in data:
            properties["仕事哲学"] = {
                "rich_text": [{"text": {"content": str(data["workPhilosophy"])}}]
            }
        
        # 他のセクションも同様に処理
        # 実際のデータベース構造に合わせて調整が必要
        
        return properties
    
    def _parse_life_plan(self, notion_page: Dict) -> Dict:
        """Notionページを人生計画辞書に変換"""
        props = notion_page.get("properties", {})
        # 実際のデータベース構造に合わせて実装
        return {
            "notion_id": notion_page.get("id"),
            "data": props
        }
    
    # ===== LIFEルール データベース操作 =====
    
    def get_life_rules(self) -> List[Dict]:
        """LIFEルールデータベースからルールを取得"""
        db_id = self.find_database_by_name("LIFEルール")
        if not db_id:
            return []
        
        results = self.query_database(db_id)
        return [self._parse_life_rule(result) for result in results]
    
    def update_life_rule(self, rule_id: str, rule_data: Dict) -> bool:
        """LIFEルールを更新"""
        properties = {
            "Title": {
                "title": [{"text": {"content": rule_data.get("title", "")}}]
            },
            "Content": {
                "rich_text": [{"text": {"content": str(rule_data.get("items", []))}}]
            }
        }
        return self.update_page(rule_id, properties)
    
    def _parse_life_rule(self, notion_page: Dict) -> Dict:
        """NotionページをLIFEルール辞書に変換"""
        props = notion_page.get("properties", {})
        
        title = ""
        title_prop = props.get("Title") or props.get("タイトル")
        if title_prop:
            title_array = title_prop.get("title", [])
            if title_array:
                title = title_array[0].get("text", {}).get("content", "")
        
        content = ""
        content_prop = props.get("Content") or props.get("内容")
        if content_prop:
            rich_text = content_prop.get("rich_text", [])
            if rich_text:
                content = rich_text[0].get("text", {}).get("content", "")
        
        return {
            "notion_id": notion_page.get("id"),
            "title": title,
            "content": content
        }

