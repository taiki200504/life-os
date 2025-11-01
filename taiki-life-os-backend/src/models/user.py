from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import enum

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    display_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    tasks = db.relationship('Task', backref='user', lazy=True, cascade='all, delete-orphan')
    sessions = db.relationship('Session', backref='user', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('DailyReview', backref='user', lazy=True, cascade='all, delete-orphan')
    okrs = db.relationship('OKR', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email}>'

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'display_name': self.display_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class TaskStatus(enum.Enum):
    INBOX = 'inbox'
    TODAY = 'today'
    DONE = 'done'

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum(TaskStatus), nullable=False, default=TaskStatus.INBOX)
    area = db.Column(db.String(50))  # EGG, UNION, Regalia, Personal
    impact = db.Column(db.Integer)  # 1-5
    effort = db.Column(db.Integer)  # 1-5
    deadline = db.Column(db.Date)
    context = db.Column(db.JSON)  # Array of context tags
    notion_id = db.Column(db.String(100))  # Notion page ID for sync
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Task {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'status': self.status.value if self.status else None,
            'area': self.area,
            'impact': self.impact,
            'effort': self.effort,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'context': self.context,
            'notion_id': self.notion_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    project = db.Column(db.String(100), nullable=False)
    start_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_at = db.Column(db.DateTime)
    planned_min = db.Column(db.Integer, nullable=False, default=90)
    actual_min = db.Column(db.Integer)
    context = db.Column(db.JSON)  # Array of context tags
    notes = db.Column(db.Text)

    def __repr__(self):
        return f'<Session {self.project}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'project': self.project,
            'start_at': self.start_at.isoformat() if self.start_at else None,
            'end_at': self.end_at.isoformat() if self.end_at else None,
            'planned_min': self.planned_min,
            'actual_min': self.actual_min,
            'context': self.context,
            'notes': self.notes
        }

class DailyReview(db.Model):
    __tablename__ = 'reviews_daily'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    deep_work_min = db.Column(db.Integer, nullable=False)
    top3 = db.Column(db.JSON)  # Array of top 3 achievements
    blockers = db.Column(db.JSON)  # Array of blockers
    learn = db.Column(db.Text)
    stop_doing = db.Column(db.Text)
    score = db.Column(db.Integer)  # 0-5

    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='unique_user_date'),)

    def __repr__(self):
        return f'<DailyReview {self.date}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'deep_work_min': self.deep_work_min,
            'top3': self.top3,
            'blockers': self.blockers,
            'learn': self.learn,
            'stop_doing': self.stop_doing,
            'score': self.score
        }

class OKR(db.Model):
    __tablename__ = 'okr'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    objective = db.Column(db.Text, nullable=False)
    period = db.Column(db.String(20), nullable=False)  # e.g., '2025Q4'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    key_results = db.relationship('KeyResult', backref='okr', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<OKR {self.objective}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'objective': self.objective,
            'period': self.period,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'key_results': [kr.to_dict() for kr in self.key_results]
        }

class KeyResult(db.Model):
    __tablename__ = 'kr'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    okr_id = db.Column(db.String(36), db.ForeignKey('okr.id'), nullable=False)
    title = db.Column(db.Text, nullable=False)
    target_numeric = db.Column(db.Numeric)
    unit = db.Column(db.String(50))
    source = db.Column(db.String(20))  # sessions, tasks, manual
    calc = db.Column(db.Text)  # SQL/式（sessions/tasksから集計）

    def __repr__(self):
        return f'<KeyResult {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'okr_id': self.okr_id,
            'title': self.title,
            'target_numeric': float(self.target_numeric) if self.target_numeric else None,
            'unit': self.unit,
            'source': self.source,
            'calc': self.calc
        }
