import api, { DEFAULT_USER_ID } from './api';
import { KPIDashboard } from '../types';

export const kpiService = {
  // KPIダッシュボード取得
  async getDashboard(date?: string): Promise<KPIDashboard> {
    const response = await api.get('/kpi/dashboard', {
      params: {
        user_id: DEFAULT_USER_ID,
        date,
      },
    });
    return response.data;
  },

  // KPIトレンド取得
  async getTrends(days: number = 30): Promise<{
    trends: Array<{
      date: string;
      routine_rate: number;
      deep_work_minutes: number;
    }>;
    period: {
      start: string;
      end: string;
      days: number;
    };
  }> {
    const response = await api.get('/kpi/trends', {
      params: {
        user_id: DEFAULT_USER_ID,
        days,
      },
    });
    return response.data;
  },
};

export default kpiService;
