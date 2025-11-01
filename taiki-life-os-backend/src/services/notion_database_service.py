import requests
import json
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from src.services.notion_service import NotionService

class NotionDatabaseService:
    """Notionデータベースの検索・分析を行うサービス"""
    
    def __init__(self, api_key: str = None):
        self.notion_service = NotionService(api_key)
        self.api_key = api_key
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}" if api_key else "",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
    
    def search_databases(self, query: str = "") -> List[Dict]:
        """データベースを検索"""
        payload = {
            "filter": {
                "value": "database",
                "property": "object"
            }
        }
        
        if query:
            payload["query"] = query
        
        try:
            response = requests.post(
                f"{self.base_url}/search",
                headers=self.headers,
                json=payload
            )
            if response.status_code == 200:
                return response.json()["results"]
            return []
        except Exception as e:
            print(f"Error searching databases: {e}")
            return []
    
    def get_page_children(self, page_id: str) -> List[Dict]:
        """ページの子要素（データベースを含む）を取得"""
        try:
            response = requests.get(
                f"{self.base_url}/blocks/{page_id}/children",
                headers=self.headers
            )
            if response.status_code == 200:
                return response.json()["results"]
            return []
        except Exception as e:
            print(f"Error getting page children: {e}")
            return []
    
    def get_database_info(self, database_id: str) -> Optional[Dict]:
        """データベースの詳細情報を取得"""
        try:
            response = requests.get(
                f"{self.base_url}/databases/{database_id}",
                headers=self.headers
            )
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error getting database info: {e}")
            return None
    
    def analyze_database_structure(self, database_id: str) -> Dict:
        """データベースの構造を分析"""
        db_info = self.get_database_info(database_id)
        if not db_info:
            return {}
        
        analysis = {
            "id": database_id,
            "title": self._extract_title(db_info.get("title", [])),
            "properties": {},
            "property_count": 0,
            "created_time": db_info.get("created_time"),
            "last_edited_time": db_info.get("last_edited_time")
        }
        
        properties = db_info.get("properties", {})
        analysis["property_count"] = len(properties)
        
        for prop_name, prop_info in properties.items():
            analysis["properties"][prop_name] = {
                "type": prop_info.get("type"),
                "id": prop_info.get("id")
            }
            
            # 特定のプロパティタイプの詳細情報を追加
            if prop_info.get("type") == "select":
                options = prop_info.get("select", {}).get("options", [])
                analysis["properties"][prop_name]["options"] = [opt.get("name") for opt in options]
            elif prop_info.get("type") == "multi_select":
                options = prop_info.get("multi_select", {}).get("options", [])
                analysis["properties"][prop_name]["options"] = [opt.get("name") for opt in options]
        
        return analysis
    
    def get_database_sample_data(self, database_id: str, limit: int = 5) -> List[Dict]:
        """データベースのサンプルデータを取得"""
        try:
            payload = {
                "page_size": limit
            }
            response = requests.post(
                f"{self.base_url}/databases/{database_id}/query",
                headers=self.headers,
                json=payload
            )
            if response.status_code == 200:
                return response.json()["results"]
            return []
        except Exception as e:
            print(f"Error getting sample data: {e}")
            return []
    
    def find_databases_by_keywords(self, keywords: List[str]) -> List[Dict]:
        """キーワードでデータベースを検索"""
        all_databases = []
        
        # 各キーワードで検索
        for keyword in keywords:
            databases = self.search_databases(keyword)
            all_databases.extend(databases)
        
        # 重複を除去
        unique_databases = {}
        for db in all_databases:
            db_id = db.get("id")
            if db_id and db_id not in unique_databases:
                unique_databases[db_id] = db
        
        return list(unique_databases.values())
    
    def analyze_all_accessible_databases(self) -> List[Dict]:
        """アクセス可能な全データベースを分析"""
        databases = self.search_databases()
        analyses = []
        
        for db in databases:
            db_id = db.get("id")
            if db_id:
                analysis = self.analyze_database_structure(db_id)
                if analysis:
                    analyses.append(analysis)
        
        return analyses
    
    def _extract_title(self, title_array: List[Dict]) -> str:
        """Notionのタイトル配列からテキストを抽出"""
        if not title_array:
            return ""
        
        title_parts = []
        for item in title_array:
            if item.get("type") == "text":
                content = item.get("text", {}).get("content", "")
                if content:
                    title_parts.append(content)
        
        return "".join(title_parts)
    
    def suggest_app_integration(self, database_analysis: Dict) -> Dict:
        """データベース分析結果からアプリ連携の提案を生成"""
        title = database_analysis.get("title", "").lower()
        properties = database_analysis.get("properties", {})
        
        suggestions = {
            "integration_type": "unknown",
            "recommended_usage": [],
            "required_properties": [],
            "missing_properties": [],
            "confidence": 0
        }
        
        # タスク管理系の判定
        if any(keyword in title for keyword in ["タスク", "task", "todo", "やること"]):
            suggestions["integration_type"] = "task_management"
            suggestions["recommended_usage"] = [
                "日次タスクの表示",
                "タスク完了状態の同期",
                "新しいタスクの追加"
            ]
            suggestions["required_properties"] = ["name", "completed", "date"]
            
            # 必要なプロパティの確認
            has_name = any("name" in prop.lower() or "タイトル" in prop.lower() or "title" in prop.lower() for prop in properties.keys())
            has_completed = any("completed" in prop.lower() or "完了" in prop.lower() or "done" in prop.lower() for prop in properties.keys())
            has_date = any("date" in prop.lower() or "日付" in prop.lower() or "日時" in prop.lower() for prop in properties.keys())
            
            confidence = 0
            if has_name:
                confidence += 40
            if has_completed:
                confidence += 40
            if has_date:
                confidence += 20
            
            suggestions["confidence"] = confidence
            
            if not has_name:
                suggestions["missing_properties"].append("タスク名/タイトル")
            if not has_completed:
                suggestions["missing_properties"].append("完了状態")
            if not has_date:
                suggestions["missing_properties"].append("日付")
        
        # 目標管理系の判定
        elif any(keyword in title for keyword in ["目標", "goal", "進捗", "progress"]):
            suggestions["integration_type"] = "goal_management"
            suggestions["recommended_usage"] = [
                "週間目標の表示",
                "進捗の同期",
                "目標達成状況の追跡"
            ]
            suggestions["required_properties"] = ["name", "current", "target"]
            suggestions["confidence"] = 70
        
        # メトリクス系の判定
        elif any(keyword in title for keyword in ["メトリクス", "metrics", "記録", "log"]):
            suggestions["integration_type"] = "metrics"
            suggestions["recommended_usage"] = [
                "日次メトリクスの記録",
                "習慣トラッキング",
                "統計データの表示"
            ]
            suggestions["required_properties"] = ["date", "value", "category"]
            suggestions["confidence"] = 60
        
        return suggestions

