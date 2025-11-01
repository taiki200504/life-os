import api, { DEFAULT_USER_ID } from './api';
import type { DailyReview } from '../types';

export const reviewService = {
  // 日次レビュー作成/更新
  async createOrUpdateReview(data: {
    date: string;
    deep_work_min: number;
    top3?: string[];
    blockers?: string[];
    learn?: string;
    stop_doing?: string;
    score?: number;
  }): Promise<{ message: string; review: DailyReview }> {
    const response = await api.post('/reviews/daily', {
      ...data,
      user_id: DEFAULT_USER_ID,
    });
    return response.data;
  },

  // 日次レビュー一覧取得
  async getReviews(filters?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<{ reviews: DailyReview[] }> {
    const response = await api.get('/reviews/daily', {
      params: {
        user_id: DEFAULT_USER_ID,
        ...filters,
      },
    });
    return response.data;
  },

  // 特定日のレビュー取得
  async getReviewByDate(date: string): Promise<{ review: DailyReview | null }> {
    const response = await api.get(`/reviews/daily/${date}`, {
      params: {
        user_id: DEFAULT_USER_ID,
      },
    });
    return response.data;
  },

  // 今日のレビュー取得
  async getTodayReview(): Promise<{ review: DailyReview | null; date: string }> {
    const response = await api.get('/reviews/daily/today', {
      params: {
        user_id: DEFAULT_USER_ID,
      },
    });
    return response.data;
  },

  // レビュー削除
  async deleteReview(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/reviews/daily/${id}`);
    return response.data;
  },
};

export default reviewService;
