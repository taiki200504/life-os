"""
Notion Sync Service - Notion APIとの双方向同期を管理
"""
import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from src.models.user import db, Task, TaskStatus, User


NOTION_TOKEN = os.getenv('NOTION_TOKEN')
if not NOTION_TOKEN:
    raise ValueError("NOTION_TOKEN environment variable is required")
NOTION_VERSION = '2022-06-28'
NOTION_API_BASE = 'https://api.notion.com/v1'

# データベースID
TAIKI_TASK_DB_ID = '27fe50949125803fb4cf000cc224824e'

class NotionSyncService:
    def __init__(self):
        self.headers = {
            'Authorization': f'Bearer {NOTION_TOKEN}',
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json'
        }
        # 最後の同期時刻を記録するファイルパス
        self.last_sync_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'last_sync.txt')
    
    def _get_last_sync_time(self) -> Optional[str]:
        """最後の同期時刻を取得"""
        try:
            if os.path.exists(self.last_sync_file):
                with open(self.last_sync_file, 'r') as f:
                    return f.read().strip()
        except Exception:
            pass
        return None
    
    def _update_last_sync_time(self):
        """最後の同期時刻を更新"""
        try:
            os.makedirs(os.path.dirname(self.last_sync_file), exist_ok=True)
            with open(self.last_sync_file, 'w') as f:
                f.write(datetime.utcnow().isoformat())
        except Exception as e:
            print(f'Error updating last sync time: {e}')
    
    # ========== Notion API呼び出し ==========
    
    def query_database(self, database_id: str, filter_params: Optional[Dict] = None) -> List[Dict]:
        """Notionデータベースをクエリ"""
        url = f'{NOTION_API_BASE}/databases/{database_id}/query'
        payload = {}
        if filter_params:
            payload['filter'] = filter_params
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return response.json().get('results', [])
        except requests.exceptions.RequestException as e:
            print(f'Error querying Notion database: {e}')
            return []
    
    def create_page(self, database_id: str, properties: Dict) -> Optional[Dict]:
        """Notionページを作成"""
        url = f'{NOTION_API_BASE}/pages'
        payload = {
            'parent': {'database_id': database_id},
            'properties': properties
        }
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f'Error creating Notion page: {e}')
            return None
    
    def update_page(self, page_id: str, properties: Dict) -> Optional[Dict]:
        """Notionページを更新"""
        url = f'{NOTION_API_BASE}/pages/{page_id}'
        payload = {'properties': properties}
        
        try:
            response = requests.patch(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f'Error updating Notion page: {e}')
            return None
    
    def archive_page(self, page_id: str) -> bool:
        """Notionページをアーカイブ"""
        url = f'{NOTION_API_BASE}/pages/{page_id}'
        payload = {'archived': True}
        
        try:
            response = requests.patch(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f'Error archiving Notion page: {e}')
            return False
    
    # ========== タスク同期 ==========
    
    def sync_tasks_from_notion(self) -> Dict[str, int]:
        """NotionからタスクをTaiki Life OSに同期"""
        results = {'created': 0, 'updated': 0, 'errors': 0}
        
        # Notionからタスクを取得
        notion_tasks = self.query_database(TAIKI_TASK_DB_ID)
        
        # デフォルトユーザーを取得（存在しない場合は作成）
        user = User.query.filter_by(id='default-user').first()
        if not user:
            user = User(
                id='default-user',
                email='default-user@example.com',
                display_name='Default User'
            )
            db.session.add(user)
            db.session.commit()
        
        for notion_task in notion_tasks:
            try:
                # Notionのプロパティを解析
                props = notion_task.get('properties', {})
                
                # タスク名
                title_prop = props.get('Name') or props.get('タスク名') or props.get('Task')
                if not title_prop:
                    continue
                
                title = ''
                if title_prop.get('title'):
                    title = ''.join([t.get('plain_text', '') for t in title_prop['title']])
                
                if not title:
                    continue
                
                # ステータス
                status_prop = props.get('Status') or props.get('ステータス')
                status = TaskStatus.INBOX
                if status_prop and status_prop.get('select'):
                    status_text = status_prop['select'].get('name', '').lower()
                    if 'today' in status_text or '今日' in status_text:
                        status = TaskStatus.TODAY
                    elif 'done' in status_text or '完了' in status_text:
                        status = TaskStatus.DONE
                
                # エリア
                area_prop = props.get('Area') or props.get('エリア')
                area = None
                if area_prop and area_prop.get('select'):
                    area = area_prop['select'].get('name')
                
                # 期限
                deadline_prop = props.get('Deadline') or props.get('期限')
                deadline = None
                if deadline_prop and deadline_prop.get('date'):
                    deadline_str = deadline_prop['date'].get('start')
                    if deadline_str:
                        try:
                            deadline = datetime.strptime(deadline_str.split('T')[0], '%Y-%m-%d').date()
                        except (ValueError, IndexError):
                            deadline = None
                
                # Notion IDで既存タスクを検索
                notion_id = notion_task['id']
                existing_task = Task.query.filter_by(notion_id=notion_id).first()
                
                if existing_task:
                    # 更新
                    existing_task.title = title
                    existing_task.status = status
                    existing_task.area = area
                    existing_task.deadline = deadline
                    existing_task.updated_at = datetime.utcnow()
                    results['updated'] += 1
                else:
                    # 新規作成
                    new_task = Task(
                        user_id='default-user',
                        title=title,
                        status=status,
                        area=area,
                        deadline=deadline,
                        notion_id=notion_id
                    )
                    db.session.add(new_task)
                    results['created'] += 1
                
            except Exception as e:
                print(f'Error syncing task from Notion: {e}')
                results['errors'] += 1
        
        db.session.commit()
        
        # 最後の同期時刻を更新
        self._update_last_sync_time()
        
        return results
    
    def sync_tasks_to_notion(self) -> Dict[str, int]:
        """Taiki Life OSからNotionにタスクを同期"""
        results = {'created': 0, 'updated': 0, 'errors': 0}
        
        # Notion IDが未設定のタスクを取得
        tasks_without_notion = Task.query.filter(
            db.or_(Task.notion_id.is_(None), Task.notion_id == '')
        ).all()
        
        for task in tasks_without_notion:
            try:
                # Notionプロパティを構築
                properties = {
                    'Name': {
                        'title': [{'text': {'content': task.title}}]
                    }
                }
                
                # ステータス
                status_map = {
                    TaskStatus.INBOX: 'Inbox',
                    TaskStatus.TODAY: 'Today',
                    TaskStatus.DONE: 'Done'
                }
                properties['Status'] = {
                    'select': {'name': status_map.get(task.status, 'Inbox')}
                }
                
                # エリア
                if task.area:
                    properties['Area'] = {
                        'select': {'name': task.area}
                    }
                
                # 期限
                if task.deadline:
                    properties['Deadline'] = {
                        'date': {'start': task.deadline.isoformat()}
                    }
                
                # Notionにページを作成
                notion_page = self.create_page(TAIKI_TASK_DB_ID, properties)
                
                if notion_page:
                    # Notion IDを保存
                    task.notion_id = notion_page['id']
                    task.updated_at = datetime.utcnow()
                    results['created'] += 1
                else:
                    results['errors'] += 1
                
            except Exception as e:
                print(f'Error syncing task to Notion: {e}')
                results['errors'] += 1
        
        # Notion IDが設定済みで更新されたタスクを同期（最近5分以内に更新されたもの）
        five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
        updated_tasks = Task.query.filter(
            Task.notion_id.isnot(None),
            Task.notion_id != '',
            Task.updated_at >= five_minutes_ago
        ).all()
        
        for task in updated_tasks:
            try:
                properties = {}
                
                # ステータス
                status_map = {
                    TaskStatus.INBOX: 'Inbox',
                    TaskStatus.TODAY: 'Today',
                    TaskStatus.DONE: 'Done'
                }
                properties['Status'] = {
                    'select': {'name': status_map.get(task.status, 'Inbox')}
                }
                
                # タイトルも更新する場合
                properties['Name'] = {
                    'title': [{'text': {'content': task.title}}]
                }
                
                # Notionページを更新
                if self.update_page(task.notion_id, properties):
                    results['updated'] += 1
                else:
                    results['errors'] += 1
                
            except Exception as e:
                print(f'Error updating task in Notion: {e}')
                results['errors'] += 1
        
        db.session.commit()
        
        # 最後の同期時刻を更新
        self._update_last_sync_time()
        
        return results
    
    def sync_all(self) -> Dict[str, Any]:
        """すべてのデータを双方向同期"""
        results = {
            'timestamp': datetime.now().isoformat(),
            'from_notion': {},
            'to_notion': {}
        }
        
        # Notion → Taiki Life OS
        results['from_notion']['tasks'] = self.sync_tasks_from_notion()
        
        # Taiki Life OS → Notion
        results['to_notion']['tasks'] = self.sync_tasks_to_notion()
        
        # 最後の同期時刻を更新
        self._update_last_sync_time()
        
        return results


# グローバルインスタンス
notion_sync = NotionSyncService()
