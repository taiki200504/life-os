import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../services/sessionService';
import type { Session } from '../types';

function StopSession() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActiveSession();
  }, []);

  const loadActiveSession = async () => {
    try {
      setLoading(true);
      const { active_session } = await sessionService.getActiveSession();
      
      if (!active_session) {
        setError('アクティブなセッションがありません');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      setSession(active_session);
    } catch (err) {
      console.error('Failed to load active session:', err);
      setError('セッション情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!session) return;

    setStopping(true);
    setError('');

    try {
      await sessionService.stopSession(session.id, notes);
      navigate('/');
    } catch (err) {
      console.error('Failed to stop session:', err);
      setError('セッションの終了に失敗しました');
    } finally {
      setStopping(false);
    }
  };

  const getElapsedTime = () => {
    if (!session) return '0分';
    
    const start = new Date(session.start_at);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
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

  if (error && !session) {
    return (
      <div className="max-w-3xl mx-auto px-4">
        <div className="card text-center">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
            <p className="text-red-800 font-semibold text-lg mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4">
      <div className="card space-y-8">
        {/* ヘッダー */}
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stop Session</h1>
          <p className="text-gray-600 font-medium">セッションを終了します</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {session && (
          <>
            {/* セッション情報カード */}
            <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{session.project}</h2>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white text-black">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Running
                </span>
              </div>

              <div className="space-y-4 border-t border-gray-700 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">開始時刻</span>
                  <span className="font-bold text-lg">
                    {new Date(session.start_at).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">予定時間</span>
                  <span className="font-bold text-lg">{session.planned_min}分</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <span className="text-gray-300 font-semibold">経過時間</span>
                  <span className="font-black text-3xl text-white">{getElapsedTime()}</span>
                </div>
              </div>

              {session.context && session.context.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wide">コンテキスト</p>
                  <div className="flex flex-wrap gap-2">
                    {session.context.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ノート入力 */}
            <div>
              <label htmlFor="session-notes" className="label">
                ノート（任意）
              </label>
              <textarea
                id="session-notes"
                name="session-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="セッションの振り返りや気づきを記録..."
                rows={6}
                autoComplete="off"
                className="input-field resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                何を達成したか、どんな学びがあったかを記録しましょう
              </p>
            </div>

            {/* アクションボタン */}
            <div className="pt-6 border-t border-gray-200 space-y-3">
              <button
                type="button"
                onClick={handleStop}
                disabled={stopping}
                className="btn-primary w-full py-4 text-lg"
              >
                {stopping ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    終了中...
                  </span>
                ) : (
                  'セッション終了'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition"
              >
                キャンセル
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StopSession;
