import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, CheckCircle, AlertCircle, RotateCcw as Sync, Bell, Palette, User } from 'lucide-react';

const Settings = () => {
  const [config, setConfig] = useState({
    configured: false,
    database_ids: {}
  });
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/notion/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('設定の取得に失敗しました:', error);
    }
  };

  const syncWithNotion = async () => {
    setSyncing(true);
    setMessage({ type: '', text: '' });

    try {
      // 日次タスクの同期
      const tasksResponse = await fetch('/api/notion/sync/daily-tasks', {
        method: 'POST',
      });

      // 週間目標の同期
      const goalsResponse = await fetch('/api/notion/sync/weekly-goals', {
        method: 'POST',
      });

      if (tasksResponse.ok && goalsResponse.ok) {
        setMessage({ type: 'success', text: 'Notionとの同期が完了しました' });
      } else {
        setMessage({ type: 'error', text: '同期中にエラーが発生しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '同期に失敗しました' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-purple-100 rounded-lg">
          <SettingsIcon className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">設定</h1>
          <p className="text-gray-600">アプリケーション設定とデータ管理</p>
        </div>
      </div>

      {/* Notion接続状況 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Notion連携状況
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {config.configured ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-medium ${config.configured ? 'text-green-700' : 'text-red-700'}`}>
              {config.configured ? 'Notion API接続済み' : 'Notion API未接続'}
            </span>
          </div>

          {config.configured && (
            <div className="ml-8 space-y-2 text-sm text-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>✓ Daily Tasks Database</div>
                <div>✓ Weekly Goals Database</div>
                <div>✓ Metrics Database</div>
                <div>✓ 自動同期設定済み</div>
              </div>
            </div>
          )}

          {config.configured && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={syncWithNotion}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sync className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? '同期中...' : '手動同期'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* アプリケーション設定 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          アプリケーション設定
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">ダークモード</h3>
              <p className="text-sm text-gray-600">画面の表示テーマを変更</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">縮退モード自動切り替え</h3>
              <p className="text-sm text-gray-600">タスク未完了時に自動で縮退モードに切り替え</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 通知設定 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          通知設定
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">毎朝のメール通知</h3>
              <p className="text-sm text-gray-600">毎朝7:00に進捗レポートをメール送信</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">タスク完了通知</h3>
              <p className="text-sm text-gray-600">タスク完了時にブラウザ通知を表示</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* プロフィール設定 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          プロフィール
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value="taiki.mishima.biz@gmail.com"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイムゾーン
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* メッセージ表示 */}
      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* 情報 */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Taiki Life OS について</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>バージョン: 1.0.0 (Noise-Free Edition)</p>
          <p>最終更新: 2025年9月6日</p>
          <p>Notion連携により、あなたの生産性向上をサポートします。</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;

