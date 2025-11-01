// Task関連の型定義
export type TaskStatus = 'inbox' | 'today' | 'done';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  status: TaskStatus;
  area?: string;
  impact?: number;
  effort?: number;
  deadline?: string;
  context?: string[];
  created_at: string;
  updated_at: string;
}

// Session関連の型定義
export interface Session {
  id: string;
  user_id: string;
  project: string;
  start_at: string;
  end_at?: string;
  planned_min: number;
  actual_min?: number;
  context?: string[];
  notes?: string;
}

// DailyReview関連の型定義
export interface DailyReview {
  id: string;
  user_id: string;
  date: string;
  deep_work_min: number;
  top3?: string[];
  blockers?: string[];
  learn?: string;
  stop_doing?: string;
  score?: number;
}

// KPI関連の型定義
export interface KPIMetric {
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'danger';
}

export interface KPIDashboard {
  date: string;
  week_range: {
    start: string;
    end: string;
  };
  kpis: {
    routine_execution_rate: KPIMetric;
    weekly_deep_work: KPIMetric;
    inbox_overdue: KPIMetric;
    review_submission_rate: KPIMetric;
    automation_rate: KPIMetric;
  };
  today_sessions: {
    total_sessions: number;
    completed_sessions: number;
    active_sessions: number;
    total_minutes: number;
    sessions: Session[];
  };
  task_stats: {
    inbox: number;
    today: number;
    done: number;
    total: number;
  };
}

// OKR関連の型定義
export interface KeyResult {
  id: string;
  okr_id: string;
  title: string;
  target_numeric?: number;
  unit?: string;
  source?: string;
  calc?: string;
}

export interface OKR {
  id: string;
  user_id: string;
  objective: string;
  period: string;
  created_at: string;
  key_results: KeyResult[];
}
