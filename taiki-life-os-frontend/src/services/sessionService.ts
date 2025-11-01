import api, { DEFAULT_USER_ID } from './api';
import type { Session } from '../types';

export const sessionService = {
  // セッション開始
  async startSession(data: {
    project: string;
    duration?: number;
    context?: string[];
  }): Promise<{ id: string; planned_end: string; session: Session }> {
    const response = await api.post('/sessions/start', {
      ...data,
      user_id: DEFAULT_USER_ID,
    });
    return response.data;
  },

  // セッション終了
  async stopSession(id: string, notes?: string): Promise<{ actual_min: number; session: Session }> {
    const response = await api.post('/sessions/stop', {
      id,
      notes,
    });
    return response.data;
  },

  // セッション一覧取得
  async getSessions(limit: number = 50): Promise<{ sessions: Session[] }> {
    const response = await api.get('/sessions', {
      params: {
        user_id: DEFAULT_USER_ID,
        limit,
      },
    });
    return response.data;
  },

  // アクティブセッション取得
  async getActiveSession(): Promise<{ active_session: Session | null }> {
    const response = await api.get('/sessions/active', {
      params: {
        user_id: DEFAULT_USER_ID,
      },
    });
    return response.data;
  },

  // 特定セッション取得
  async getSession(id: string): Promise<{ session: Session }> {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },
};

export default sessionService;
