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

  const presetProjects = [
    'Deep Work',
    'EGG',
    'UNION',
    'Regalia',
    'Personal',
    'Learning',
    'Exercise',
  ];

  const presetDurations = [
    { label: '25分', value: 25 },
    { label: '45分', value: 45 },
    { label: '90分', value: 90 },
    { label: '120分', value: 120 },
  ];

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

      navigate('/');
    } catch (err) {
      console.error('Failed to start session:', err);
      setError('セッションの開始に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4">
      <div className="card space-y-8">
        {/* ヘッダー */}
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Session</h1>
          <p className="text-gray-600 font-medium">新しい作業セッションを開始します</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* プロジェクト選択 */}
          <div>
            <label htmlFor="project-name" className="label">
              プロジェクト名 <span className="text-red-500">*</span>
            </label>
            <input
              id="project-name"
              name="project-name"
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="プロジェクト名を入力"
              autoComplete="off"
              className="input-field text-lg"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {presetProjects.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setProject(preset)}
                  className="px-4 py-2 text-sm border-2 border-gray-300 rounded-full hover:border-black hover:bg-black hover:text-white transition-all duration-200 font-medium"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 時間設定 */}
          <div>
            <label className="label">
              予定時間
            </label>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {presetDurations.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setDuration(preset.value)}
                  className={`py-4 rounded-xl font-semibold transition-all duration-200 ${
                    duration === preset.value
                      ? 'bg-black text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <input
                id="duration-slider"
                name="duration"
                type="range"
                min="15"
                max="180"
                step="15"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <p className="text-center text-lg font-bold text-gray-900">
                {duration}分
              </p>
            </div>
          </div>

          {/* コンテキストタグ */}
          <div>
            <label className="label">
              コンテキスト（任意）
            </label>
            <div className="flex flex-wrap gap-3">
              {contextTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleContextToggle(tag)}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    context.includes(tag)
                      ? 'bg-black text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {context.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                選択中: {context.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="pt-6 border-t border-gray-200 space-y-3">
          <button
            type="button"
            onClick={handleStart}
            disabled={loading || !project.trim()}
            className="btn-primary w-full py-4 text-lg"
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
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartSession;
