import { useState } from 'react';
import { notionService } from '../services/notionService';

function NotionSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSync = async () => {
    setSyncing(true);
    setShowResult(false);

    try {
      const result = await notionService.syncAll();
      setSyncResult(result.results);
      setLastSync(new Date().toLocaleTimeString('ja-JP'));
      setShowResult(true);

      // 3秒後に結果を非表示
      setTimeout(() => setShowResult(false), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncResult({ error: 'Sync failed' });
      setShowResult(true);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleSync}
        disabled={syncing}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          syncing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <svg
          className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span className="text-sm font-medium">
          {syncing ? 'Syncing...' : 'Sync with Notion'}
        </span>
      </button>

      {showResult && syncResult && !syncResult.error && (
        <div className="absolute top-full mt-2 right-0 bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg z-10 min-w-[200px]">
          <p className="text-xs font-semibold text-green-900 mb-1">Sync completed!</p>
          <div className="text-xs text-green-700 space-y-1">
            <div>From Notion: {syncResult.from_notion?.tasks?.created || 0} created, {syncResult.from_notion?.tasks?.updated || 0} updated</div>
            <div>To Notion: {syncResult.to_notion?.tasks?.created || 0} created, {syncResult.to_notion?.tasks?.updated || 0} updated</div>
          </div>
          {lastSync && (
            <p className="text-xs text-green-600 mt-2">Last sync: {lastSync}</p>
          )}
        </div>
      )}

      {showResult && syncResult?.error && (
        <div className="absolute top-full mt-2 right-0 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg z-10">
          <p className="text-xs font-semibold text-red-900">Sync failed</p>
          <p className="text-xs text-red-700">{syncResult.error}</p>
        </div>
      )}
    </div>
  );
}

export default NotionSyncButton;
