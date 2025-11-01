from datetime import datetime
import json

from src.models.user import db

class NotionConfig(db.Model):
    """Notion API設定を管理するモデル"""
    __tablename__ = 'notion_config'
    
    id = db.Column(db.Integer, primary_key=True)
    api_key = db.Column(db.String(255), nullable=False)
    daily_tasks_db_id = db.Column(db.String(255), nullable=True)
    weekly_goals_db_id = db.Column(db.String(255), nullable=True)
    metrics_db_id = db.Column(db.String(255), nullable=True)
    life_plan_db_id = db.Column(db.String(255), nullable=True)
    current_self_db_id = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DailyTask(db.Model):
    """日次タスクのローカルキャッシュ"""
    __tablename__ = 'daily_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    notion_id = db.Column(db.String(255), unique=True, nullable=True)
    name = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(100), nullable=True)
    duration = db.Column(db.Integer, nullable=True)  # 分単位
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    synced_at = db.Column(db.DateTime, nullable=True)

class WeeklyGoal(db.Model):
    """週間目標のローカルキャッシュ"""
    __tablename__ = 'weekly_goals'
    
    id = db.Column(db.Integer, primary_key=True)
    notion_id = db.Column(db.String(255), unique=True, nullable=True)
    name = db.Column(db.String(255), nullable=False)
    current = db.Column(db.Integer, default=0)
    target = db.Column(db.Integer, nullable=False)
    week_start = db.Column(db.Date, nullable=False)
    unit = db.Column(db.String(50), default='回')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    synced_at = db.Column(db.DateTime, nullable=True)

class Metric(db.Model):
    """軽量メトリクスのローカルキャッシュ"""
    __tablename__ = 'metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    notion_id = db.Column(db.String(255), unique=True, nullable=True)
    name = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)
    completed = db.Column(db.Boolean, default=False)
    week_start = db.Column(db.Date, nullable=False)
    score = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    synced_at = db.Column(db.DateTime, nullable=True)

class LifePlanItem(db.Model):
    """人生計画アイテムのローカルキャッシュ"""
    __tablename__ = 'life_plan_items'
    
    id = db.Column(db.Integer, primary_key=True)
    notion_id = db.Column(db.String(255), unique=True, nullable=True)
    title = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    content = db.Column(db.Text, nullable=True)
    priority = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='進行中')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    synced_at = db.Column(db.DateTime, nullable=True)

class CurrentSelfItem(db.Model):
    """現在の自分アイテムのローカルキャッシュ"""
    __tablename__ = 'current_self_items'
    
    id = db.Column(db.Integer, primary_key=True)
    notion_id = db.Column(db.String(255), unique=True, nullable=True)
    title = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(100), nullable=True)
    content = db.Column(db.Text, nullable=True)
    importance = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    synced_at = db.Column(db.DateTime, nullable=True)

class SyncLog(db.Model):
    """同期ログ"""
    __tablename__ = 'sync_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    table_name = db.Column(db.String(100), nullable=False)
    operation = db.Column(db.String(50), nullable=False)  # CREATE, UPDATE, DELETE
    record_id = db.Column(db.Integer, nullable=True)
    notion_id = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), default='PENDING')  # PENDING, SUCCESS, FAILED
    error_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)

