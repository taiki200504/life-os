import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../services/reviewService';
import type { DailyReview } from '../types';

function Review() {
  const navigate = useNavigate();
  const [deepWorkMin, setDeepWorkMin] = useState(0);
  const [top3, setTop3] = useState(['', '', '']);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [blockerInput, setBlockerInput] = useState('');
  const [learn, setLearn] = useState('');
  const [stopDoing, setStopDoing] = useState('');
  const [score, setScore] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingReview, setExistingReview] = useState<DailyReview | null>(null);

  useEffect(() => {
    loadTodayReview();
  }, []);

  const loadTodayReview = async () => {
    try {
      setLoading(true);
      const { review } = await reviewService.getTodayReview();
      
      if (review) {
        setExistingReview(review);
        setDeepWorkMin(review.deep_work_min);
        setTop3(review.top3 || ['', '', '']);
        setBlockers(review.blockers || []);
        setLearn(review.learn || '');
        setStopDoing(review.stop_doing || '');
        setScore(review.score);
      }
    } catch (err) {
      console.error('Failed to load today review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTop3Change = (index: number, value: string) => {
    const newTop3 = [...top3];
    newTop3[index] = value;
    setTop3(newTop3);
  };

  const handleAddBlocker = () => {
    if (blockerInput.trim()) {
      setBlockers([...blockers, blockerInput.trim()]);
      setBlockerInput('');
    }
  };

  const handleRemoveBlocker = (index: number) => {
    setBlockers(blockers.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (deepWorkMin < 0) {
      setError('Deep Work時間を入力してください');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      
      await reviewService.createOrUpdateReview({
        date: today,
        deep_work_min: deepWorkMin,
        top3: top3.filter((item) => item.trim() !== ''),
        blockers: blockers.length > 0 ? blockers : undefined,
        learn: learn.trim() || undefined,
        stop_doing: stopDoing.trim() || undefined,
        score,
      });

      // ダッシュボードに戻る
      navigate('/');
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError('レビューの送信に失敗しました');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daily Review</h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('ja-JP', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
          {existingReview && (
            <p className="text-sm text-blue-600 mt-2">
              ✓ 今日のレビューは既に提出済みです（編集可能）
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Deep Work時間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deep Work時間（分） *
          </label>
          <input
            type="number"
            value={deepWorkMin}
            onChange={(e) => setDeepWorkMin(Number(e.target.value))}
            min="0"
            step="15"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">
            今日の集中作業時間（目標: 1日120分以上）
          </p>
        </div>

        {/* Top 3 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Top 3（今日の3つの成果）
          </label>
          {top3.map((item, index) => (
            <input
              key={index}
              type="text"
              value={item}
              onChange={(e) => handleTop3Change(index, e.target.value)}
              placeholder={`成果 ${index + 1}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent mb-3"
            />
          ))}
        </div>

        {/* Blockers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blockers（障害・課題）
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={blockerInput}
              onChange={(e) => setBlockerInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddBlocker()}
              placeholder="障害や課題を入力"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              onClick={handleAddBlocker}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              追加
            </button>
          </div>
          {blockers.length > 0 && (
            <div className="space-y-2">
              {blockers.map((blocker, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-2"
                >
                  <span className="text-sm text-red-800">{blocker}</span>
                  <button
                    onClick={() => handleRemoveBlocker(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learn（今日の学び）
          </label>
          <textarea
            value={learn}
            onChange={(e) => setLearn(e.target.value)}
            placeholder="今日学んだこと、気づいたことを記録..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
        </div>

        {/* Stop Doing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stop Doing（やめること）
          </label>
          <textarea
            value={stopDoing}
            onChange={(e) => setStopDoing(e.target.value)}
            placeholder="明日からやめること、改善すること..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
        </div>

        {/* Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            今日のスコア（0-5）
          </label>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setScore(value)}
                className={`flex-1 py-3 rounded-lg font-bold text-lg transition ${
                  score === value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            0: 最悪 | 3: 普通 | 5: 最高
          </p>
        </div>

        {/* 送信ボタン */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting || deepWorkMin < 0}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
              submitting || deepWorkMin < 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {submitting ? (
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
                送信中...
              </span>
            ) : existingReview ? (
              'レビューを更新'
            ) : (
              'レビューを送信'
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
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">📝 レビューのコツ</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• 毎日同じ時間にレビューする習慣をつけましょう</li>
          <li>• 正直に振り返ることが成長につながります</li>
          <li>• 目標は週のレビュー提出率85%以上です</li>
        </ul>
      </div>
    </div>
  );
}

export default Review;
