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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'danger':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
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
    <div className="space-y-6 pb-24">
      {/* ウェルカムセクション */}
      <div className="card">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome back! 👋
        </h2>
        <p className="text-lg text-gray-600 font-medium">
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
        <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Active Session</h3>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white text-black">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Running
            </span>
          </div>
          <p className="text-3xl font-bold mb-4">{activeSession.project}</p>
          <p className="text-gray-300 text-base mb-6">
            Started: {new Date(activeSession.start_at).toLocaleTimeString('ja-JP')}
          </p>
          <Link
            to="/stop"
            className="block w-full bg-white text-black text-center py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
          >
            Stop Session
          </Link>
        </div>
      )}

      {/* クイックアクション */}
      {!activeSession && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/start"
            className="card-elevated group hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Start</h3>
                <p className="text-sm text-gray-600 mt-1">Begin session</p>
              </div>
            </div>
          </Link>

          <Link
            to="/review"
            className="card-elevated group hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Review</h3>
                <p className="text-sm text-gray-600 mt-1">Daily review</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* KPIカード */}
      {kpiData && kpiData.kpis && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">KPI Overview</h3>
            <button
              type="button"
              onClick={() => setShowTrends(!showTrends)}
              className="text-sm font-semibold text-gray-700 hover:text-black transition flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              {showTrends ? '隠す' : 'トレンドを表示'}
              <svg className={`w-4 h-4 transition-transform duration-200 ${showTrends ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* ルーティン実行率 */}
            <div className={`card border-2 ${getStatusColor(kpiData.kpis.routine_execution_rate?.status || 'warning')}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold uppercase tracking-wide">Routine Rate</p>
                <span className="text-xl">{getStatusIcon(kpiData.kpis.routine_execution_rate?.status || 'warning')}</span>
              </div>
              <p className="text-4xl font-black mt-2">
                {kpiData.kpis.routine_execution_rate?.value ?? 0}%
              </p>
              <p className="text-xs font-medium mt-2 opacity-75">Target: {kpiData.kpis.routine_execution_rate?.target ?? 85}%</p>
            </div>

            {/* Deep Work */}
            <div className={`card border-2 ${getStatusColor(kpiData.kpis.weekly_deep_work?.status || 'warning')}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold uppercase tracking-wide">Deep Work</p>
                <span className="text-xl">{getStatusIcon(kpiData.kpis.weekly_deep_work?.status || 'warning')}</span>
              </div>
              <p className="text-4xl font-black mt-2">
                {Math.floor((kpiData.kpis.weekly_deep_work?.value ?? 0) / 60)}h
              </p>
              <p className="text-xs font-medium mt-2 opacity-75">
                {kpiData.kpis.weekly_deep_work?.value ?? 0}分 / 週
              </p>
            </div>

            {/* INBOX滞留 */}
            <div className={`card border-2 ${getStatusColor(kpiData.kpis.inbox_overdue?.status || 'warning')}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold uppercase tracking-wide">Inbox Overdue</p>
                <span className="text-xl">{getStatusIcon(kpiData.kpis.inbox_overdue?.status || 'warning')}</span>
              </div>
              <p className="text-4xl font-black mt-2">
                {kpiData.kpis.inbox_overdue?.value ?? 0}
              </p>
              <p className="text-xs font-medium mt-2 opacity-75">24h+ tasks</p>
            </div>

            {/* レビュー提出率 */}
            <div className={`card border-2 ${getStatusColor(kpiData.kpis.review_submission_rate?.status || 'warning')}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold uppercase tracking-wide">Review Rate</p>
                <span className="text-xl">{getStatusIcon(kpiData.kpis.review_submission_rate?.status || 'warning')}</span>
              </div>
              <p className="text-4xl font-black mt-2">
                {kpiData.kpis.review_submission_rate?.value ?? 0}%
              </p>
              <p className="text-xs font-medium mt-2 opacity-75">This week</p>
            </div>
          </div>

          {/* トレンドチャート */}
          {showTrends && (
            <div className="card mt-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-gray-900">KPI Trends</h4>
                <div className="flex gap-2">
                  {[7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setTrendDays(days)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        trendDays === days
                          ? 'bg-black text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
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
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Tasks</h3>
            <Link
              to="/tasks"
              className="text-sm font-semibold text-gray-700 hover:text-black transition flex items-center gap-1"
            >
              すべて見る
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-5xl font-black text-gray-900 mb-2">{kpiData.task_stats.inbox ?? 0}</p>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Inbox</p>
            </div>
            <div>
              <p className="text-5xl font-black text-black mb-2">{kpiData.task_stats.today ?? 0}</p>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Today</p>
            </div>
            <div>
              <p className="text-5xl font-black text-green-600 mb-2">{kpiData.task_stats.done ?? 0}</p>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Done</p>
            </div>
          </div>
        </div>
      )}

      {/* 今日のセッション */}
      {kpiData && kpiData.today_sessions && kpiData.today_sessions.total_sessions > 0 && (
        <div className="card">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Today's Sessions</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-5 text-center">
              <p className="text-3xl font-black text-gray-900 mb-2">{kpiData.today_sessions.total_sessions}</p>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Sessions</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 text-center">
              <p className="text-3xl font-black text-gray-900 mb-2">
                {Math.floor(kpiData.today_sessions.total_minutes / 60)}h {kpiData.today_sessions.total_minutes % 60}m
              </p>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Time</p>
            </div>
          </div>
          <div className="space-y-3">
            {kpiData.today_sessions.sessions.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-bold text-gray-900">{session.project}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(session.start_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="text-lg font-bold text-gray-700">
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
