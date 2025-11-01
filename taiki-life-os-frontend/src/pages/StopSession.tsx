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
      
      // ダッシュボードに戻る
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Stop Session</h1>
          <p className="text-gray-600">セッションを終了します</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {session && (
          <>
            {/* セッション情報 */}
            <div className="bg-black text-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{session.project}</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white text-black">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Running
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">開始時刻</span>
                  <span className="font-medium">
                    {new Date(session.start_at).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">予定時間</span>
                  <span className="font-medium">{session.planned_min}分</span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                  <span className="text-gray-300">経過時間</span>
                  <span className="font-bold text-lg">{getElapsedTime()}</span>
                </div>
              </div>

              {session.context && session.context.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">コンテキスト</p>
                  <div className="flex flex-wrap gap-2">
                    {session.context.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ノート（任意）
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="セッションの振り返りや気づきを記録..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                何を達成したか、どんな学びがあったかを記録しましょう
              </p>
            </div>

            {/* 終了ボタン */}
            <div className="pt-4">
              <button
                onClick={handleStop}
                disabled={stopping}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
                  stopping
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
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
            </div>

            {/* キャンセルボタン */}
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 text-gray-600 hover:text-gray-900 transition"
            >
              キャンセル
            </button>
          </>
        )}
      </div>

      {/* ヒント */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">✅ お疲れ様でした！</h3>
        <p className="text-sm text-green-800">
          セッション終了後は、必ず日次レビューで振り返りを行いましょう。
        </p>
      </div>
    </div>
  );
}

export default StopSession;
