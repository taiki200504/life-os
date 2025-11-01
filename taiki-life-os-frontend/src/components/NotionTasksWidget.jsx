import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, RefreshCw, Calendar, Clock } from 'lucide-react';

const NotionTasksWidget = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE = window.location.origin;

  // タスクを取得
  const fetchTasks = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/notion/daily-tasks`);
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.tasks);
        setLastSync(new Date());
      } else {
        setError(data.error || 'タスクの取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Error fetching tasks:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // タスクの完了状態を更新
  const toggleTaskCompletion = async (taskId, currentCompleted) => {
    try {
      const response = await fetch(`${API_BASE}/api/notion/daily-tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !currentCompleted
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // ローカル状態を更新
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, completed: !currentCompleted }
              : task
          )
        );
      } else {
        setError(data.error || 'タスクの更新に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Error updating task:', err);
    }
  };

  // 今日のタスクを初期化
  const initializeTodayTasks = async () => {
    setSyncing(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/notion/daily-tasks/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchTasks(false);
      } else {
        setError(data.error || 'タスクの初期化に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Error initializing tasks:', err);
    } finally {
      setSyncing(false);
    }
  };

  // 手動同期
  const handleSync = async () => {
    setSyncing(true);
    await fetchTasks(false);
    setSyncing(false);
  };

  // 初回読み込み
  useEffect(() => {
    fetchTasks();
  }, []);

  // カテゴリ別の色設定
  const getCategoryColor = (category) => {
    const colors = {
      '静寂': 'bg-blue-100 text-blue-800',
      '深い仕事': 'bg-purple-100 text-purple-800',
      '運動': 'bg-green-100 text-green-800',
      '学習': 'bg-yellow-100 text-yellow-800',
      '感謝': 'bg-pink-100 text-pink-800',
      'リセット': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // 完了率を計算
  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">今日のタスク</h3>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">今日のタスク</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Notionと同期"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* 進捗バー */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {completionRate}%
          </span>
        </div>
        
        {lastSync && (
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            最終同期: {lastSync.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* タスクリスト */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Circle className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 mb-4">今日のタスクがまだありません</p>
            <button
              onClick={initializeTodayTasks}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {syncing ? '初期化中...' : '今日のタスクを作成'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                  task.completed 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => toggleTaskCompletion(task.id, task.completed)}
                  className="flex-shrink-0 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {task.name}
                    </span>
                    {task.category && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(task.category)}`}>
                        {task.category}
                      </span>
                    )}
                  </div>
                  
                  {task.duration && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.duration}分
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フッター */}
      {tasks.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {tasks.filter(task => task.completed).length} / {tasks.length} 完了
            </span>
            <span className="text-xs">
              Notion連携
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotionTasksWidget;

