import { useState, useEffect } from 'react'

const NotionStatus = () => {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [activities, setActivities] = useState([])

  useEffect(() => {
    fetchNotionStatus()
    fetchRecentActivity()
  }, [])

  const fetchNotionStatus = async () => {
    try {
      const response = await fetch('/api/notion/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Notionステータス取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/notion/recent-activity')
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('アクティビティ取得エラー:', error)
    }
  }

  const handleSyncNow = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/notion/sync-now', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        // ステータスを再取得
        await fetchNotionStatus()
        await fetchRecentActivity()
        alert('Notionとの同期が完了しました！')
      } else {
        alert(`同期エラー: ${data.error}`)
      }
    } catch (error) {
      console.error('同期エラー:', error)
      alert('同期中にエラーが発生しました')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Notion連携状況</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          status?.connected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status?.connected ? '接続済み' : '未接続'}
        </div>
      </div>

      <div className="space-y-4">
        {/* 接続状況 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">APIキー</p>
            <p className="font-medium">
              {status?.api_key_configured ? '設定済み' : '未設定'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ページID</p>
            <p className="font-medium">
              {status?.page_id_configured ? '設定済み' : '未設定'}
            </p>
          </div>
        </div>

        {/* 最終同期時刻 */}
        {status?.last_sync && (
          <div>
            <p className="text-sm text-gray-600">最終同期</p>
            <p className="font-medium">{status.last_sync}</p>
          </div>
        )}

        {/* エラー表示 */}
        {status?.connection_error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              <strong>接続エラー:</strong> {status.connection_error}
            </p>
          </div>
        )}

        {/* 手動同期ボタン */}
        <button
          onClick={handleSyncNow}
          disabled={syncing || !status?.connected}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            syncing || !status?.connected
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {syncing ? '同期中...' : 'Notionと同期'}
        </button>

        {/* 最近のアクティビティ */}
        {activities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">最近のアクティビティ</h4>
            <div className="space-y-2">
              {activities.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-gray-600">{activity.message}</span>
                  <span className="text-gray-400 text-xs">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotionStatus

