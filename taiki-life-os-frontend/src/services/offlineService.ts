import { db, isOnline, addToSyncQueue } from '../utils/db';
import type { Task, Session, DailyReview, TaskStatus } from '../types';
import { taskService } from './taskService';
import { sessionService } from './sessionService';
import { reviewService } from './reviewService';

// オフライン対応のタスクサービス
export const offlineTaskService = {
  async getTasks(status?: TaskStatus): Promise<Task[]> {
    if (isOnline()) {
      try {
        const response = await taskService.getTasks({ status });
        // オンライン時はIndexedDBにもキャッシュ
        await db.tasks.bulkPut(response.tasks);
        return response.tasks;
      } catch (error) {
        console.error('Failed to fetch tasks online, falling back to cache:', error);
      }
    }
    
    // オフライン時またはオンライン取得失敗時はIndexedDBから取得
    if (status) {
      return await db.tasks.where('status').equals(status).toArray();
    }
    return await db.tasks.toArray();
  },

  async createTask(data: { title: string; status?: TaskStatus; area?: string; impact?: number; effort?: number; deadline?: string; context?: string[] }): Promise<Task> {
    const task: Task = {
      id: `temp-${Date.now()}`,
      user_id: 'default-user',
      title: data.title,
      status: data.status || 'inbox',
      area: data.area,
      impact: data.impact,
      effort: data.effort,
      deadline: data.deadline,
      context: data.context,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // IndexedDBに保存
    await db.tasks.add(task);

    if (isOnline()) {
      try {
        const response = await taskService.createTask(data);
        // 成功したら一時IDを実際のIDに置き換え
        await db.tasks.delete(task.id);
        await db.tasks.add(response.task);
        return response.task;
      } catch (error) {
        console.error('Failed to create task online:', error);
        // 同期キューに追加
        await addToSyncQueue('task', 'create', data);
      }
    } else {
      // オフライン時は同期キューに追加
      await addToSyncQueue('task', 'create', data);
    }

    return task;
  },

  async moveTask(id: string, status: TaskStatus): Promise<void> {
    // IndexedDBを更新
    await db.tasks.update(id, { status, updated_at: new Date().toISOString() });

    if (isOnline()) {
      try {
        await taskService.moveTask(id, status);
      } catch (error) {
        console.error('Failed to move task online:', error);
        await addToSyncQueue('task', 'update', { id, status });
      }
    } else {
      await addToSyncQueue('task', 'update', { id, status });
    }
  },

  async deleteTask(id: string): Promise<void> {
    // IndexedDBから削除
    await db.tasks.delete(id);

    if (isOnline()) {
      try {
        await taskService.deleteTask(id);
      } catch (error) {
        console.error('Failed to delete task online:', error);
        await addToSyncQueue('task', 'delete', { id });
      }
    } else {
      await addToSyncQueue('task', 'delete', { id });
    }
  },
};

// オフライン対応のセッションサービス
export const offlineSessionService = {
  async startSession(data: { project: string; duration?: number; context?: string[] }): Promise<Session> {
    const session: Session = {
      id: `temp-${Date.now()}`,
      user_id: 'default-user',
      project: data.project,
      start_at: new Date().toISOString(),
      planned_min: data.duration || 90,
      context: data.context,
    };

    // IndexedDBに保存
    await db.sessions.add(session);

    if (isOnline()) {
      try {
        const response = await sessionService.startSession(data);
        // 成功したら一時IDを実際のIDに置き換え
        await db.sessions.delete(session.id);
        await db.sessions.add(response.session);
        return response.session;
      } catch (error) {
        console.error('Failed to start session online:', error);
        await addToSyncQueue('session', 'create', data);
      }
    } else {
      await addToSyncQueue('session', 'create', data);
    }

    return session;
  },

  async stopSession(id: string, notes?: string): Promise<void> {
    const now = new Date().toISOString();
    const session = await db.sessions.get(id);
    
    if (session) {
      const start = new Date(session.start_at);
      const end = new Date(now);
      const actual_min = Math.floor((end.getTime() - start.getTime()) / 60000);

      await db.sessions.update(id, {
        end_at: now,
        actual_min,
        notes,
      });

      if (isOnline()) {
        try {
          await sessionService.stopSession(id, notes);
        } catch (error) {
          console.error('Failed to stop session online:', error);
          await addToSyncQueue('session', 'update', { id, notes });
        }
      } else {
        await addToSyncQueue('session', 'update', { id, notes });
      }
    }
  },

  async getActiveSession(): Promise<Session | null> {
    if (isOnline()) {
      try {
        const response = await sessionService.getActiveSession();
        return response.active_session;
      } catch (error) {
        console.error('Failed to get active session online:', error);
      }
    }

    // オフライン時はIndexedDBから取得
    const sessions = await db.sessions
      .where('end_at')
      .equals(undefined as any)
      .toArray();
    
    return sessions[0] || null;
  },
};

// オフライン対応のレビューサービス
export const offlineReviewService = {
  async createOrUpdateReview(data: { date: string; deep_work_min: number; top3?: string[]; blockers?: string[]; learn?: string; stop_doing?: string; score?: number }): Promise<DailyReview> {
    const review: DailyReview = {
      id: data.date || `temp-${Date.now()}`,
      user_id: 'default-user',
      date: data.date,
      deep_work_min: data.deep_work_min,
      top3: data.top3,
      blockers: data.blockers,
      learn: data.learn,
      stop_doing: data.stop_doing,
      score: data.score,
    };

    // IndexedDBに保存
    await db.reviews.put(review);

    if (isOnline()) {
      try {
        const response = await reviewService.createOrUpdateReview(data);
        await db.reviews.put(response.review);
        return response.review;
      } catch (error) {
        console.error('Failed to save review online:', error);
        await addToSyncQueue('review', 'create', data);
      }
    } else {
      await addToSyncQueue('review', 'create', data);
    }

    return review;
  },

  async getTodayReview(): Promise<DailyReview | null> {
    const today = new Date().toISOString().split('T')[0];

    if (isOnline()) {
      try {
        const response = await reviewService.getTodayReview();
        if (response.review) {
          await db.reviews.put(response.review);
        }
        return response.review;
      } catch (error) {
        console.error('Failed to get today review online:', error);
      }
    }

    // オフライン時はIndexedDBから取得
    const review = await db.reviews.where('date').equals(today).first();
    return review || null;
  },
};

// オンライン/オフライン状態の監視
export function setupOnlineStatusMonitoring(): void {
  window.addEventListener('online', () => {
    console.log('Network status: online');
    // オンライン復帰時に通知を表示
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Taiki Life OS', {
        body: 'オンラインに復帰しました。データを同期中...',
        icon: '/icons/AppIcon_1024_black.png',
      });
    }
  });

  window.addEventListener('offline', () => {
    console.log('Network status: offline');
    // オフライン時に通知を表示
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Taiki Life OS', {
        body: 'オフラインモードで動作しています',
        icon: '/icons/AppIcon_1024_black.png',
      });
    }
  });
}

// 通知権限をリクエスト
export async function requestNotificationPermission(): Promise<void> {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}
