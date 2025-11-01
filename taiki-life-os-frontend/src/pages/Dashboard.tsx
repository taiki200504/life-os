import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { kpiService } from '../services/kpiService';
import { sessionService } from '../services/sessionService';
import type { KPIDashboard, Session } from '../types';
import KPITrendChart from '../components/KPITrendChart';

function Dashboard() {
  const [kpiData, setKpiData] = useState<KPIDashboard | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrends, setShowTrends] = useState(false);
  const [trendDays, setTrendDays] = useState(7);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [kpi, session] = await Promise.all([
        kpiService.getDashboard(),
        sessionService.getActiveSession(),
      ]);
      setKpiData(kpi);
      setActiveSession(session.active_session);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'danger':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return '✓';
      case 'warning':
        return '⚠';
      case 'danger':
        return '✕';
      default:
        return '•';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ウェルカムセクション */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back! 👋
        </h2>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('ja-JP', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </p>
      </div>

      {/* アクティブセッション */}
      {activeSession && (
        <div className="bg-black text-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Session</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white text-black">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Running
            </span>
          </div>
          <p className="text-xl font-bold mb-2">{activeSession.project}</p>
          <p className="text-gray-300 text-sm">
            Started: {new Date(activeSession.start_at).toLocaleTimeString('ja-JP')}
          </p>
          <Link
            to="/stop"
            className="mt-4 block w-full bg-white text-black text-center py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Stop Session
          </Link>
        </div>
      )}

      {/* クイックアクション */}
      {!activeSession && (
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/start"
            className="bg-black text-white rounded-lg shadow-sm p-6 hover:bg-gray-800 transition"
          >
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold">Start</h3>
            <p className="text-sm text-gray-300 mt-1">Begin session</p>
          </Link>

          <Link
            to="/review"
            className="bg-white border-2 border-black rounded-lg shadow-sm p-6 hover:bg-gray-50 transition"
          >
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="font-semibold">Review</h3>
            <p className="text-sm text-gray-600 mt-1">Daily review</p>
          </Link>
        </div>
      )}

      {/* KPIカード */}
      {kpiData && kpiData.kpis && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">KPI Overview</h3>
            <button
              onClick={() => setShowTrends(!showTrends)}
              className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1"
            >
              {showTrends ? '隠す' : 'トレンドを表示'}
              <svg className={`w-4 h-4 transition-transform ${showTrends ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* ルーティン実行率 */}
            <div className={`rounded-lg border p-4 ${getStatusColor(kpiData.kpis.routine_execution_rate?.status || 'warning')}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Routine Rate</p>
                <span className="text-lg">{getStatusIcon(kpiData.kpis.routine_execution_rate?.status || 'warning')}</span>
              </div>
              <p className="text-3xl font-bold mt-1">
                {kpiData.kpis.routine_execution_rate?.value ?? 0}%
              </p>
              <p className="text-xs mt-1 opacity-75">Target: {kpiData.kpis.routine_execution_rate?.target ?? 85}%</p>
            </div>

            {/* Deep Work */}
            <div className={`rounded-lg border p-4 ${getStatusColor(kpiData.kpis.weekly_deep_work?.status || 'warning')}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Deep Work</p>
                <span className="text-lg">{getStatusIcon(kpiData.kpis.weekly_deep_work?.status || 'warning')}</span>
              </div>
              <p className="text-3xl font-bold mt-1">
                {Math.floor((kpiData.kpis.weekly_deep_work?.value ?? 0) / 60)}h
              </p>
              <p className="text-xs mt-1 opacity-75">
                {kpiData.kpis.weekly_deep_work?.value ?? 0}分 / 週
              </p>
            </div>

            {/* INBOX滞留 */}
            <div className={`rounded-lg border p-4 ${getStatusColor(kpiData.kpis.inbox_overdue?.status || 'warning')}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Inbox Overdue</p>
                <span className="text-lg">{getStatusIcon(kpiData.kpis.inbox_overdue?.status || 'warning')}</span>
              </div>
              <p className="text-3xl font-bold mt-1">
                {kpiData.kpis.inbox_overdue?.value ?? 0}
              </p>
              <p className="text-xs mt-1 opacity-75">24h+ tasks</p>
            </div>

            {/* レビュー提出率 */}
            <div className={`rounded-lg border p-4 ${getStatusColor(kpiData.kpis.review_submission_rate?.status || 'warning')}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Review Rate</p>
                <span className="text-lg">{getStatusIcon(kpiData.kpis.review_submission_rate?.status || 'warning')}</span>
              </div>
              <p className="text-3xl font-bold mt-1">
                {kpiData.kpis.review_submission_rate?.value ?? 0}%
              </p>
              <p className="text-xs mt-1 opacity-75">This week</p>
            </div>
          </div>

          {/* トレンドチャート */}
          {showTrends && (
            <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">KPI Trends</h4>
                <div className="flex gap-2">
                  {[7, 14, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setTrendDays(days)}
                      className={`px-3 py-1 text-sm rounded-lg transition ${
                        trendDays === days
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {days}日
                    </button>
                  ))}
                </div>
              </div>
              <KPITrendChart days={trendDays} />
            </div>
          )}
        </div>
      )}

      {/* タスク統計 */}
      {kpiData && kpiData.task_stats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
            <Link
              to="/tasks"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-4xl font-bold text-gray-900">{kpiData.task_stats.inbox ?? 0}</p>
              <p className="text-sm text-gray-600 mt-1">Inbox</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-black">{kpiData.task_stats.today ?? 0}</p>
              <p className="text-sm text-gray-600 mt-1">Today</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600">{kpiData.task_stats.done ?? 0}</p>
              <p className="text-sm text-gray-600 mt-1">Done</p>
            </div>
          </div>
        </div>
      )}

      {/* 今日のセッション */}
      {kpiData && kpiData.today_sessions && kpiData.today_sessions.total_sessions > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Sessions</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{kpiData.today_sessions.total_sessions}</p>
              <p className="text-xs text-gray-600 mt-1">Total Sessions</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{Math.floor(kpiData.today_sessions.total_minutes / 60)}h {kpiData.today_sessions.total_minutes % 60}m</p>
              <p className="text-xs text-gray-600 mt-1">Total Time</p>
            </div>
          </div>
          <div className="space-y-2">
            {kpiData.today_sessions.sessions.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{session.project}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(session.start_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {session.actual_min || session.planned_min}分
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
