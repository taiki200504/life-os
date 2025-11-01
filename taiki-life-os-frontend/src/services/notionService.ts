import api from './api';

export const notionService = {
  // すべてのデータを双方向同期
  async syncAll() {
    const response = await api.post('/notion/sync');
    return response.data;
  },

  // Notionからデータを取得
  async syncFromNotion() {
    const response = await api.post('/notion/sync/from-notion');
    return response.data;
  },

  // Notionにデータを送信
  async syncToNotion() {
    const response = await api.post('/notion/sync/to-notion');
    return response.data;
  },

  // 同期ステータスを取得
  async getSyncStatus() {
    const response = await api.get('/notion/sync/status');
    return response.data;
  },
};
