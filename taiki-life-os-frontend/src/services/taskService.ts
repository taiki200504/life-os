import api, { DEFAULT_USER_ID } from './api';
import type { Task, TaskStatus } from '../types';

export const taskService = {
  // タスク作成
  async createTask(data: {
    title: string;
    status?: TaskStatus;
    area?: string;
    impact?: number;
    effort?: number;
    deadline?: string;
    context?: string[];
  }): Promise<{ message: string; task: Task }> {
    const response = await api.post('/tasks', {
      ...data,
      user_id: DEFAULT_USER_ID,
    });
    return response.data;
  },

  // タスク一覧取得
  async getTasks(filters?: {
    status?: TaskStatus;
    area?: string;
    limit?: number;
  }): Promise<{ tasks: Task[] }> {
    const response = await api.get('/tasks', {
      params: {
        user_id: DEFAULT_USER_ID,
        ...filters,
      },
    });
    return response.data;
  },

  // INBOXタスク取得
  async getInboxTasks(): Promise<{ tasks: Task[]; count: number }> {
    const response = await api.get('/tasks/inbox', {
      params: {
        user_id: DEFAULT_USER_ID,
      },
    });
    return response.data;
  },

  // TODAYタスク取得
  async getTodayTasks(): Promise<{ tasks: Task[]; count: number }> {
    const response = await api.get('/tasks/today', {
      params: {
        user_id: DEFAULT_USER_ID,
      },
    });
    return response.data;
  },

  // DONEタスク取得
  async getDoneTasks(limit: number = 50): Promise<{ tasks: Task[]; count: number }> {
    const response = await api.get('/tasks/done', {
      params: {
        user_id: DEFAULT_USER_ID,
        limit,
      },
    });
    return response.data;
  },

  // タスク更新
  async updateTask(id: string, data: Partial<Task>): Promise<{ message: string; task: Task }> {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  // タスクステータス変更
  async moveTask(id: string, status: TaskStatus): Promise<{ message: string; task: Task }> {
    const response = await api.post(`/tasks/${id}/move`, { status });
    return response.data;
  },

  // タスク削除
  async deleteTask(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // 特定タスク取得
  async getTask(id: string): Promise<{ task: Task }> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
};

export default taskService;
