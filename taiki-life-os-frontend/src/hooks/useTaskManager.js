import { useState, useEffect, useCallback } from 'react';

export const useTaskManager = () => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 今日の日次タスクを取得
  const fetchDailyTasks = useCallback(async (date = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const dateParam = date || new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/tasks/daily?date=${dateParam}`);
      
      if (response.ok) {
        const data = await response.json();
        setDailyTasks(data.tasks);
        return data.tasks;
      } else {
        const data = await response.json();
        setError(data.error || 'タスクの取得に失敗しました');
        return [];
      }
    } catch (err) {
      setError('タスクの取得中にエラーが発生しました');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 今週の週間目標を取得
  const fetchWeeklyGoals = useCallback(async (week = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const weekParam = week || new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/tasks/weekly?week=${weekParam}`);
      
      if (response.ok) {
        const data = await response.json();
        setWeeklyGoals(data.goals);
        return data.goals;
      } else {
        const data = await response.json();
        setError(data.error || '週間目標の取得に失敗しました');
        return [];
      }
    } catch (err) {
      setError('週間目標の取得中にエラーが発生しました');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // メトリクスを取得
  const fetchMetrics = useCallback(async (week = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const weekParam = week || new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/tasks/metrics?week=${weekParam}`);
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        return data.metrics;
      } else {
        const data = await response.json();
        setError(data.error || 'メトリクスの取得に失敗しました');
        return [];
      }
    } catch (err) {
      setError('メトリクスの取得中にエラーが発生しました');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // サマリーデータを取得
  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks/summary');
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
        return data;
      } else {
        const data = await response.json();
        setError(data.error || 'サマリーの取得に失敗しました');
        return {};
      }
    } catch (err) {
      setError('サマリーの取得中にエラーが発生しました');
      return {};
    }
  }, []);

  // 日次タスクを作成
  const createDailyTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tasks/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        const data = await response.json();
        // タスクリストを再取得
        await fetchDailyTasks();
        return data;
      } else {
        const data = await response.json();
        setError(data.error || 'タスクの作成に失敗しました');
        return null;
      }
    } catch (err) {
      setError('タスクの作成中にエラーが発生しました');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchDailyTasks]);

  // 日次タスクを更新
  const updateDailyTask = useCallback(async (taskId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tasks/daily/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        // ローカル状態を更新
        setDailyTasks(prev => 
          prev.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
          )
        );
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'タスクの更新に失敗しました');
        return false;
      }
    } catch (err) {
      setError('タスクの更新中にエラーが発生しました');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 日次タスクを削除
  const deleteDailyTask = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tasks/daily/${taskId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // ローカル状態を更新
        setDailyTasks(prev => prev.filter(task => task.id !== taskId));
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'タスクの削除に失敗しました');
        return false;
      }
    } catch (err) {
      setError('タスクの削除中にエラーが発生しました');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 週間目標を更新
  const updateWeeklyGoal = useCallback(async (goalId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tasks/weekly/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        // ローカル状態を更新
        setWeeklyGoals(prev => 
          prev.map(goal => 
            goal.id === goalId ? { ...goal, ...updates } : goal
          )
        );
        return true;
      } else {
        const data = await response.json();
        setError(data.error || '週間目標の更新に失敗しました');
        return false;
      }
    } catch (err) {
      setError('週間目標の更新中にエラーが発生しました');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // メトリクスを更新
  const updateMetric = useCallback(async (metricData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tasks/metrics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricData),
      });
      
      if (response.ok) {
        // メトリクスを再取得
        await fetchMetrics();
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'メトリクスの更新に失敗しました');
        return false;
      }
    } catch (err) {
      setError('メトリクスの更新中にエラーが発生しました');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);

  // 初期データを読み込み
  useEffect(() => {
    fetchDailyTasks();
    fetchWeeklyGoals();
    fetchMetrics();
    fetchSummary();
  }, [fetchDailyTasks, fetchWeeklyGoals, fetchMetrics, fetchSummary]);

  return {
    // データ
    dailyTasks,
    weeklyGoals,
    metrics,
    summary,
    loading,
    error,
    
    // 取得関数
    fetchDailyTasks,
    fetchWeeklyGoals,
    fetchMetrics,
    fetchSummary,
    
    // 操作関数
    createDailyTask,
    updateDailyTask,
    deleteDailyTask,
    updateWeeklyGoal,
    updateMetric,
  };
};

