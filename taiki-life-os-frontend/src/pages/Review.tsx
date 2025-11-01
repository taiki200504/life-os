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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4">
      <div className="card space-y-8">
        {/* ヘッダー */}
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Review</h1>
          <div className="flex items-center gap-3">
            <p className="text-gray-600 font-medium">
              {new Date().toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
            {existingReview && (
              <span className="badge badge-success">
                ✓ 提出済み
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Deep Work時間 */}
          <div>
            <label htmlFor="deep-work-min" className="label">
              Deep Work時間（分） <span className="text-red-500">*</span>
            </label>
            <input
              id="deep-work-min"
              name="deep-work-min"
              type="number"
              value={deepWorkMin}
              onChange={(e) => setDeepWorkMin(Number(e.target.value))}
              min="0"
              step="15"
              autoComplete="off"
              className="input-field text-lg"
            />
            <p className="text-sm text-gray-500 mt-2">
              今日の集中作業時間（目標: 1日120分以上）
            </p>
          </div>

          {/* Top 3 */}
          <div>
            <label className="label">
              Top 3（今日の3つの成果）
            </label>
            <div className="space-y-3">
              {top3.map((item, index) => (
                <input
                  key={index}
                  id={`top3-${index}`}
                  name={`top3-${index}`}
                  type="text"
                  value={item}
                  onChange={(e) => handleTop3Change(index, e.target.value)}
                  placeholder={`成果 ${index + 1}`}
                  autoComplete="off"
                  className="input-field"
                />
              ))}
            </div>
          </div>

          {/* Blockers */}
          <div>
            <label htmlFor="blocker-input" className="label">
              Blockers（障害・課題）
            </label>
            <div className="flex gap-3 mb-4">
              <input
                id="blocker-input"
                name="blocker-input"
                type="text"
                value={blockerInput}
                onChange={(e) => setBlockerInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddBlocker()}
                placeholder="障害や課題を入力してEnter"
                autoComplete="off"
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={handleAddBlocker}
                className="btn-secondary whitespace-nowrap"
              >
                追加
              </button>
            </div>
            {blockers.length > 0 && (
              <div className="space-y-2">
                {blockers.map((blocker, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-red-50 border-l-4 border-red-500 rounded-lg px-4 py-3"
                  >
                    <span className="text-sm font-medium text-red-900 flex-1">{blocker}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlocker(index)}
                      className="ml-3 text-red-600 hover:text-red-800 transition p-1"
                      aria-label="削除"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learn */}
          <div>
            <label htmlFor="learn" className="label">
              Learn（今日の学び）
            </label>
            <textarea
              id="learn"
              name="learn"
              value={learn}
              onChange={(e) => setLearn(e.target.value)}
              placeholder="今日学んだこと、気づいたことを記録..."
              rows={5}
              autoComplete="off"
              className="input-field resize-none"
            />
          </div>

          {/* Stop Doing */}
          <div>
            <label htmlFor="stop-doing" className="label">
              Stop Doing（やめること）
            </label>
            <textarea
              id="stop-doing"
              name="stop-doing"
              value={stopDoing}
              onChange={(e) => setStopDoing(e.target.value)}
              placeholder="明日からやめること、改善すること..."
              rows={4}
              autoComplete="off"
              className="input-field resize-none"
            />
          </div>

          {/* Score */}
          <div>
            <label className="label">
              今日のスコア（0-5）
            </label>
            <div className="grid grid-cols-6 gap-3">
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScore(value)}
                  className={`py-4 rounded-xl font-bold text-xl transition-all duration-200 ${
                    score === value
                      ? 'bg-black text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              <span className="font-medium">0: 最悪</span> | <span className="font-medium">3: 普通</span> | <span className="font-medium">5: 最高</span>
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="pt-6 border-t border-gray-200 space-y-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || deepWorkMin < 0}
            className="btn-primary w-full py-4 text-lg"
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

export default Review;
