import axios from 'axios';

// バックエンドAPIのベースURL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axiosインスタンスの作成
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// デフォルトユーザーID（認証不要のため固定）
export const DEFAULT_USER_ID = 'default-user';

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
