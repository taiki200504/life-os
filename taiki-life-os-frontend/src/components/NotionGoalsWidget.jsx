import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, RefreshCw, Calendar, Plus, Minus } from 'lucide-react';

const NotionGoalsWidget = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE = window.location.origin;

  // 目標を取得
  const fetchGoals = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/notion/weekly-goals`);
      const data = await response.json();
      
      if (data.success) {
        setGoals(data.goals);
        setLastSync(new Date());
      } else {
        setError(data.error || '目標の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Error fetching goals:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 目標の進捗を更新
  const updateGoalProgress = async (goalId, newCurrent) => {
    try {
      const response = await fetch(`${API_BASE}/api/notion/weekly-goals/${goalId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current: newCurrent
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // ローカル状態を更新
        setGoals(prevGoals => 
          prevGoals.map(goal => 
            goal.id === goalId 
              ? { ...goal, current: newCurrent }
              : goal
          )
        );
      } else {
        setError(data.error || '進捗の更新に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Error updating goal progress:', err);
    }
  };

  // 今週の目標を初期化
  const initializeWeeklyGoals = async () => {
    setSyncing(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/notion/weekly-goals/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchGoals(false);
      } else {
        setError(data.error || '目標の初期化に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Error initializing goals:', err);
    } finally {
      setSyncing(false);
    }
  };

  // 手動同期
  const handleSync = async () => {
    setSyncing(true);
    await fetchGoals(false);
    setSyncing(false);
  };

  // 進捗の増減
  const adjustProgress = (goalId, currentValue, adjustment) => {
    const newValue = Math.max(0, currentValue + adjustment);
    updateGoalProgress(goalId, newValue);
  };

  // 初回読み込み
  useEffect(() => {
    fetchGoals();
  }, []);

  // 進捗率を計算
  const getProgressPercentage = (current, target) => {
    if (target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  // 進捗の色を取得
  const getProgressColor = (current, target) => {
    const percentage = getProgressPercentage(current, target);
    if (percentage >= 100) return 'bg-green-600';
    if (percentage >= 75) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  // 全体の達成率を計算
  const overallProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + getProgressPercentage(goal.current, goal.target), 0) / goals.length)
    : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">今週の目標</h3>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
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
          <h3 className="text-lg font-semibold text-gray-900">今週の目標</h3>
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
        
        {/* 全体進捗 */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {overallProgress}%
          </span>
        </div>
        
        {lastSync && (
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            最終同期: {lastSync.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* 目標リスト */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Target className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 mb-4">今週の目標がまだありません</p>
            <button
              onClick={initializeWeeklyGoals}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {syncing ? '初期化中...' : '今週の目標を作成'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progressPercentage = getProgressPercentage(goal.current, goal.target);
              const isCompleted = goal.current >= goal.target;
              
              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {goal.name}
                      </span>
                      {isCompleted && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => adjustProgress(goal.id, goal.current, -1)}
                        disabled={goal.current <= 0}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-center">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                      <button
                        onClick={() => adjustProgress(goal.id, goal.current, 1)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* 進捗バー */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.current, goal.target)}`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600 min-w-[35px]">
                      {progressPercentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* フッター */}
      {goals.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {goals.filter(goal => goal.current >= goal.target).length} / {goals.length} 達成
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

export default NotionGoalsWidget;

