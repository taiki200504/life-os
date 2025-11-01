import React from 'react'
import { Database, CheckCircle } from 'lucide-react'

const NotionDataIndicator = ({ isFromNotion = false, lastSync = null, className = "" }) => {
  if (!isFromNotion) return null

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full border border-blue-200">
        <Database className="w-3 h-3 text-blue-600" />
        <span className="text-xs font-medium text-blue-700">Notion</span>
        {lastSync && (
          <CheckCircle className="w-3 h-3 text-green-600" />
        )}
      </div>
      {lastSync && (
        <span className="text-xs text-gray-500">
          {new Date(lastSync).toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      )}
    </div>
  )
}

export default NotionDataIndicator

