import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../services/sessionService';

function StartSession() {
  const navigate = useNavigate();
  const [project, setProject] = useState('');
  const [duration, setDuration] = useState(90);
  const [context, setContext] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // プリセットプロジェクト
  const presetProjects = [
    'Deep Work',
    'EGG',
    'UNION',
    'Regalia',
    'Personal',
    'Learning',
    'Exercise',
  ];

  // プリセット時間
  const presetDurations = [
    { label: '25分', value: 25 },
    { label: '45分', value: 45 },
    { label: '90分', value: 90 },
    { label: '120分', value: 120 },
  ];

  // コンテキストタグ
  const contextTags = [
    'Focus',
    'Creative',
    'Planning',
    'Review',
    'Meeting',
    'Learning',
    'Exercise',
  ];

  const handleContextToggle = (tag: string) => {
    if (context.includes(tag)) {
      setContext(context.filter((t) => t !== tag));
    } else {
      setContext([...context, tag]);
    }
  };

  const handleStart = async () => {
    if (!project.trim()) {
      setError('プロジェクト名を入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sessionService.startSession({
        project: project.trim(),
        duration,
        context,
      });

      // ダッシュボードに戻る
      navigate('/');
    } catch (err) {
      console.error('Failed to start session:', err);
      setError('セッションの開始に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Start Session</h1>
          <p className="text-gray-600">新しい作業セッションを開始します</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* プロジェクト選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            プロジェクト名 *
          </label>
          <input
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="プロジェクト名を入力"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {presetProjects.map((preset) => (
              <button
                key={preset}
                onClick={() => setProject(preset)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 時間設定 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            予定時間
          </label>
          <div className="grid grid-cols-4 gap-3">
            {presetDurations.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setDuration(preset.value)}
                className={`py-3 rounded-lg font-medium transition ${
                  duration === preset.value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-center text-sm text-gray-600 mt-1">
              {duration}分
            </p>
          </div>
        </div>

        {/* コンテキストタグ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            コンテキスト（任意）
          </label>
          <div className="flex flex-wrap gap-2">
            {contextTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleContextToggle(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  context.includes(tag)
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 開始ボタン */}
        <div className="pt-4">
          <button
            onClick={handleStart}
            disabled={loading || !project.trim()}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
              loading || !project.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {loading ? (
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
                開始中...
              </span>
            ) : (
              'セッション開始'
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
      </div>

      {/* ヒント */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 ヒント</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• デフォルトは90分のDeep Workブロックです</li>
          <li>• セッション中は通知をオフにすることをおすすめします</li>
          <li>• 一点集中で最重要タスクに取り組みましょう</li>
        </ul>
      </div>
    </div>
  );
}

export default StartSession;
