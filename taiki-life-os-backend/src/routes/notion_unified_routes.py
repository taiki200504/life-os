"""
統合Notionルート - Taiki Task、Weekly Goals、人生計画、LIFEルールの統合API
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
from src.services.notion_unified_service import NotionUnifiedService
import os

notion_unified_bp = Blueprint('notion_unified', __name__)

def get_notion_service():
    """統合Notionサービスのインスタンスを取得"""
    api_key = os.getenv('NOTION_API_KEY')
    if not api_key:
        raise ValueError("NOTION_API_KEY environment variable is required")
    return NotionUnifiedService(api_key)

# ===== Taiki Task API =====

@notion_unified_bp.route('/api/notion/taiki-tasks', methods=['GET'])
def get_taiki_tasks():
    """Taiki Taskデータベースからタスクを取得"""
    try:
        date_str = request.args.get('date')
        target_date = date.today()
        
        if date_str:
            try:
                target_date = datetime.fromisoformat(date_str).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        service = get_notion_service()
        tasks = service.get_taiki_tasks(target_date)
        
        return jsonify({
            "success": True,
            "date": target_date.isoformat(),
            "tasks": tasks,
            "count": len(tasks)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@notion_unified_bp.route('/api/notion/taiki-tasks/sync', methods=['POST'])
def sync_taiki_tasks():
    """Taiki Taskを双方向同期"""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        
        service = get_notion_service()
        result = service.sync_taiki_tasks(tasks)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@notion_unified_bp.route('/api/notion/taiki-tasks/<task_id>', methods=['DELETE'])
def delete_taiki_task(task_id):
    """Taiki Taskを削除"""
    try:
        service = get_notion_service()
        success = service.delete_taiki_task(task_id)
        
        if success:
            return jsonify({"success": True, "message": "タスクを削除しました"})
        else:
            return jsonify({"success": False, "error": "タスクの削除に失敗しました"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===== Weekly Goals API =====

@notion_unified_bp.route('/api/notion/weekly-goals', methods=['GET'])
def get_weekly_goals():
    """Weekly Goalsデータベースから目標を取得"""
    try:
        week_str = request.args.get('week')
        week_start = None
        
        if week_str:
            try:
                week_start = datetime.fromisoformat(week_str).date()
                week_start = week_start - timedelta(days=week_start.weekday())
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        service = get_notion_service()
        goals = service.get_weekly_goals(week_start)
        
        return jsonify({
            "success": True,
            "goals": goals,
            "count": len(goals)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@notion_unified_bp.route('/api/notion/weekly-goals/sync', methods=['POST'])
def sync_weekly_goals():
    """Weekly Goalsを双方向同期"""
    try:
        data = request.get_json()
        goals = data.get('goals', [])
        
        service = get_notion_service()
        result = service.sync_weekly_goals(goals)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===== 人生計画 API =====

@notion_unified_bp.route('/api/notion/life-plan', methods=['GET'])
def get_life_plan():
    """人生計画データベースからデータを取得"""
    try:
        service = get_notion_service()
        life_plan = service.get_life_plan()
        
        if life_plan:
            return jsonify({
                "success": True,
                "life_plan": life_plan
            })
        else:
            return jsonify({
                "success": False,
                "error": "人生計画データが見つかりません"
            }), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@notion_unified_bp.route('/api/notion/life-plan/sync', methods=['POST'])
def sync_life_plan():
    """人生計画を双方向同期"""
    try:
        data = request.get_json()
        life_plan_data = data.get('life_plan', {})
        
        service = get_notion_service()
        success = service.update_life_plan(life_plan_data)
        
        if success:
            return jsonify({"success": True, "message": "人生計画を同期しました"})
        else:
            return jsonify({"success": False, "error": "同期に失敗しました"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===== LIFEルール API =====

@notion_unified_bp.route('/api/notion/life-rules', methods=['GET'])
def get_life_rules():
    """LIFEルールデータベースからルールを取得"""
    try:
        service = get_notion_service()
        rules = service.get_life_rules()
        
        return jsonify({
            "success": True,
            "rules": rules,
            "count": len(rules)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@notion_unified_bp.route('/api/notion/life-rules/sync', methods=['POST'])
def sync_life_rules():
    """LIFEルールを双方向同期"""
    try:
        data = request.get_json()
        rules = data.get('rules', [])
        
        service = get_notion_service()
        # 各ルールを同期
        results = []
        for rule in rules:
            rule_id = rule.get('notion_id')
            if rule_id:
                success = service.update_life_rule(rule_id, rule)
                results.append({"id": rule_id, "success": success})
            else:
                # 新規作成（必要に応じて実装）
                pass
        
        return jsonify({
            "success": True,
            "results": results,
            "message": "LIFEルールを同期しました"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@notion_unified_bp.route('/api/notion/life-rules/<rule_id>', methods=['PUT'])
def update_life_rule(rule_id):
    """LIFEルールを更新"""
    try:
        data = request.get_json()
        
        service = get_notion_service()
        success = service.update_life_rule(rule_id, data)
        
        if success:
            return jsonify({"success": True, "message": "ルールを更新しました"})
        else:
            return jsonify({"success": False, "error": "更新に失敗しました"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===== ページコンテンツ取得API =====

@notion_unified_bp.route('/api/notion/pages/<page_id>', methods=['GET'])
def get_page_content(page_id):
    """Notionページのプロパティ情報を取得"""
    try:
        service = get_notion_service()
        page = service.get_page(page_id)
        
        if page:
            return jsonify({
                "success": True,
                "page": page
            })
        else:
            return jsonify({
                "success": False,
                "error": "ページが見つかりません"
            }), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@notion_unified_bp.route('/api/notion/pages/<page_id>/blocks', methods=['GET'])
def get_page_blocks(page_id):
    """Notionページのブロック（コンテンツ）を取得"""
    try:
        recursive = request.args.get('recursive', 'true').lower() == 'true'
        
        service = get_notion_service()
        blocks = service.get_page_blocks(page_id, recursive=recursive)
        
        return jsonify({
            "success": True,
            "page_id": page_id,
            "blocks": blocks,
            "count": len(blocks)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@notion_unified_bp.route('/api/notion/pages/<page_id>/content', methods=['GET'])
def get_page_full_content(page_id):
    """ページのプロパティとブロックを含む完全なコンテンツを取得"""
    try:
        service = get_notion_service()
        content = service.get_page_full_content(page_id)
        
        if content:
            return jsonify({
                "success": True,
                "content": content
            })
        else:
            return jsonify({
                "success": False,
                "error": "ページが見つかりません"
            }), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@notion_unified_bp.route('/api/notion/pages/<page_id>/text', methods=['GET'])
def get_page_text(page_id):
    """ページの全テキストコンテンツを抽出"""
    try:
        service = get_notion_service()
        text = service.extract_page_text(page_id)
        
        return jsonify({
            "success": True,
            "page_id": page_id,
            "text": text
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@notion_unified_bp.route('/api/notion/pages/search', methods=['POST'])
def search_pages():
    """Notionワークスペース内でページを検索"""
    try:
        data = request.get_json() or {}
        query = data.get('query', '')
        
        service = get_notion_service()
        pages = service.search_pages(query)
        
        return jsonify({
            "success": True,
            "pages": pages,
            "count": len(pages)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===== データベース検索API =====

@notion_unified_bp.route('/api/notion/databases/search', methods=['POST'])
def search_databases():
    """データベース名で検索"""
    try:
        data = request.get_json()
        database_name = data.get('name')
        
        if not database_name:
            return jsonify({"error": "Database name is required"}), 400
        
        service = get_notion_service()
        db_id = service.find_database_by_name(database_name)
        
        if db_id:
            return jsonify({
                "success": True,
                "database_id": db_id,
                "name": database_name
            })
        else:
            return jsonify({
                "success": False,
                "error": f"データベース '{database_name}' が見つかりません"
            }), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

