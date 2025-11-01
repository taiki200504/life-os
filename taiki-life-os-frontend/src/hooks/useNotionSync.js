import { useState, useEffect, useCallback } from 'react';

export const useNotionSync = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);

  // 接続状態を確認
  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sync/status');
      const data = await response.json();
      
      setIsConnected(data.connection);
      setError(data.success ? null : data.message);
      
      return data.connection;
    } catch (err) {
      setError('接続確認に失敗しました');
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Notionデータベースをセットアップ
  const setupDatabases = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sync/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(true);
        setError(null);
        return { success: true, databases: data.databases };
      } else {
        setError(data.message);
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = 'データベースセットアップに失敗しました';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 日次タスクを同期
  const syncDailyTasks = useCallback(async (tasks) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sync/daily-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLastSync(new Date());
        setError(null);
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = 'タスク同期に失敗しました';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 週次目標を同期
  const syncWeeklyGoals = useCallback(async (goals) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sync/weekly-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goals }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLastSync(new Date());
        setError(null);
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = '目標同期に失敗しました';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // すべてのデータを同期
  const syncAllData = useCallback(async (tasks, goals) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sync/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks, goals }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLastSync(new Date());
        setError(null);
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = 'データ同期に失敗しました';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 自動同期（タスク完了時などに呼び出し）
  const autoSync = useCallback(async (type = 'all', data = {}) => {
    try {
      const response = await fetch('/api/sync/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, ...data }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLastSync(new Date());
        setError(null);
      } else {
        console.warn('自動同期に失敗:', result.message);
      }
      
      return result.success;
    } catch (err) {
      console.warn('自動同期エラー:', err);
      return false;
    }
  }, []);

  // 初期化時に接続状態を確認
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    isLoading,
    lastSync,
    error,
    checkConnection,
    setupDatabases,
    syncDailyTasks,
    syncWeeklyGoals,
    syncAllData,
    autoSync,
  };
};

