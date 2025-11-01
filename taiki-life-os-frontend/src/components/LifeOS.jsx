import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Target, Clock, Shield, Smartphone, Home, Heart, AlertTriangle, BarChart3, RefreshCw, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const defaultLifeOSData = [
  {
    id: 'principles',
    title: '1) 原則（コア思想）',
    icon: Target,
    color: 'text-indigo-600',
    items: [
      '引き算：足す前に捨てる。迷い＝ノイズ。',
      '環境設計：意思で戦わない。仕組みで勝つ。',
      '一点集中：その日いちばん大事な1つを前倒しで終わらせる。',
      '即復帰：崩れても"最小単位"に縮退して翌日から再開。'
    ]
  },
  {
    id: 'daily',
    title: '2) 毎日の「やるべきこと」',
    icon: Clock,
    color: 'text-green-600',
    items: [
      '静寂10分（瞑想/深呼吸/散歩、どれでもOK）',
      '深い仕事1ブロック（最重要タスクだけに没頭：25〜90分）',
      '身体を動かす（最低10分：歩く/走る/自重トレ）',
      '学習15分（英語/コード/読書のどれか）',
      '感謝/連絡1件（人間関係の貯金）',
      '5分リセット（机と床を"見えてスッキリ"状態へ）'
    ],
    note: 'できなかった日は「静寂3分・運動3分・学習3分」に縮退してOK（ゼロを作らない）。'
  },
  {
    id: 'weekly',
    title: '3) 週の「やるべきこと」',
    icon: BarChart3,
    color: 'text-purple-600',
    items: [
      '運動×4回（うち2回は心拍が上がる強度）',
      '"ふたり時間"×2（各120分：散歩/ごはん/深い対話）',
      '部屋リセット30分（クローゼット or 机どちらか）',
      'お金＆画面の棚卸し15分（サブスク/支出/スクリーンタイムを確認）',
      '次週の"最重要1つ"を決めてブロック'
    ]
  },
  {
    id: 'dont-do',
    title: '4) やらないことルール（Default-Deny）',
    icon: Shield,
    color: 'text-red-600',
    items: [
      '0時以降のSNS/動画禁止（寝室にスマホ持ち込まない）',
      '起床後30分はノースクリーン',
      'マルチタスクしない（通知は切る、タブは目的外を閉じる）',
      '同時並行で新習慣を増やさない（1つずつ、4週間固定）',
      'ベッドでスマホしない（紙の本か何もしない）',
      '予定の"その場OK"禁止（48時間ルール、後述）',
      '感情で買わない/食べない（クールダウンを挟む）'
    ]
  },
  {
    id: 'minimalist',
    title: '5) ミニマリスト90%購入ルール',
    icon: Home,
    color: 'text-orange-600',
    items: [
      '"Hell Yes（≧90%）じゃなければNO"。さらに下記すべてを満たす時だけ買う。',
      '解決する具体的な不便が1行で言える（「＿＿が毎週困る」）',
      '使用頻度：30日で7回以上使う想定が現実的',
      '1 in 1 out：同カテゴリの1点を手放す前提',
      '保管/メンテの負債が小さい（置き場・掃除・更新コスト）',
      '価格別クールダウン：〜¥5,000 → 24h待つ、¥5,001〜¥20,000 → 72h待つ、¥20,001〜 → 7日待つ（レンタル/中古を先に検討）',
      '買ったのに7回/30日使わなかったら**即"手放す候補"**へ。'
    ]
  },
  {
    id: 'digital',
    title: '6) デジタル最適化（5ルール）',
    icon: Smartphone,
    color: 'text-blue-600',
    items: [
      'ホーム画面は1枚（学習/仕事ツールのみ・SNSは2階層下）',
      '通知は原則OFF（電話/予定/連絡先限定）',
      'SNS合計45分/日（夜22:00以降は使わない）',
      '仕事/娯楽でブラウザプロファイル分離（娯楽側は常時ログアウト）',
      '週1のタイムライン掃除（ミュート/解除で"鼓舞される空間"だけ残す）'
    ]
  },
  {
    id: 'health',
    title: '7) 体・食・睡眠の最小要件',
    icon: Heart,
    color: 'text-pink-600',
    items: [
      '睡眠7h（就寝/起床を毎日ほぼ同時刻）',
      '日光＋水で朝一リセット（3分でOK）',
      'タンパク質を毎食（甘味は平日控えめ）',
      '毎日合計20分以上の有酸素 or 8,000歩（分割可）'
    ]
  },
  {
    id: 'partnership',
    title: '8) パートナーシップの最小要件',
    icon: Heart,
    color: 'text-rose-600',
    items: [
      '毎日：ありがとう1回（テキストでもOK）',
      '週2回：クオリティ時間（各120分、スマホ離脱）',
      '月1回：ステート・オブ・リレーション（今月の嬉しかったこと/改善/来月やりたいことを15分話す）'
    ]
  },
  {
    id: '48hour-rule',
    title: '9) 予定・依頼の48時間ルール',
    icon: Clock,
    color: 'text-yellow-600',
    items: [
      '予定/コラボ/新プロジェクトは即答しない',
      '48時間置いて、北極星（自己成長/パートナー）に資するかを再確認',
      'YESでも**"やらないこと"を何と引き換えにするか**を決めてから承諾'
    ]
  },
  {
    id: 'recovery',
    title: '10) 緊急時の即復帰プレイブック（3分）',
    icon: AlertTriangle,
    color: 'text-amber-600',
    items: [
      '水＋外気＋身体90秒（ジャンプ/スクワットなど）',
      '3行ログ（事実/解釈/次の最小行動）',
      '最小行動1つ（静寂3分 or 学習3分 or 片付け3分）'
    ]
  }
]

export default function LifeOS() {
  const [lifeOSData, setLifeOSData] = useState(defaultLifeOSData)
  const [expandedSections, setExpandedSections] = useState({})
  const [editMode, setEditMode] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  
  // NotionからLIFEルールを取得
  useEffect(() => {
    fetchLifeRules()
    // 5分ごとに自動同期
    const syncInterval = setInterval(() => {
      syncWithNotion()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(syncInterval)
  }, [])
  
  const fetchLifeRules = async () => {
    try {
      const response = await fetch(`${API_BASE}/notion/life-rules`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.rules && data.rules.length > 0) {
          // NotionのルールをパースしてlifeOSData形式に変換
          const parsedRules = parseNotionRules(data.rules)
          if (parsedRules.length > 0) {
            setLifeOSData(parsedRules)
            setLastSync(new Date())
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch LIFE rules from Notion:', error)
    }
  }
  
  const parseNotionRules = (notionRules) => {
    // NotionのルールデータをlifeOSData形式に変換
    // 実際のNotionデータ構造に合わせて調整が必要
    return defaultLifeOSData // 暫定
  }
  
  const syncWithNotion = async () => {
    setSyncing(true)
    try {
      // Notionに送信
      const response = await fetch(`${API_BASE}/notion/life-rules/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rules: lifeOSData.map(section => ({
            notion_id: section.notion_id,
            title: section.title,
            items: section.items
          }))
        }),
      })
      
      if (response.ok) {
        // 取得も実行
        await fetchLifeRules()
        setLastSync(new Date())
      }
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }
  
  const updateRule = (sectionId, itemIndex, newValue) => {
    setLifeOSData(prevData =>
      prevData.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item, idx) =>
                idx === itemIndex ? newValue : item
              )
            }
          : section
      )
    )
    // Notionに即座に同期
    syncWithNotion()
  }
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            🎯 Taiki Life OS — Noise-Free Edition (V1)
          </h1>
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            {editMode ? '編集モード' : '表示モード'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={syncWithNotion}
            disabled={syncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同期中...' : '同期'}
          </Button>
        </div>
        <p className="text-gray-600">
          シンプルに攻めて、ノイズを斬る。NotionのLIFEルールデータベースと同期しています。
        </p>
        {lastSync && (
          <p className="text-xs text-gray-500 mt-2">
            最終同期: {lastSync.toLocaleString('ja-JP')}
          </p>
        )}
      </div>
      
      {/* Life OS Rules */}
      <div className="space-y-4">
        {lifeOSData.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSections[section.id]
          
          return (
            <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${section.color}`} />
                  <h2 className="text-lg font-semibold text-gray-900 text-left">
                    {section.title}
                  </h2>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    {section.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                        {editMode ? (
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateRule(section.id, index, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        ) : (
                          <p className="text-gray-700 leading-relaxed">{item}</p>
                        )}
                      </div>
                    ))}
                    {section.note && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          💡 <strong>縮退ルール:</strong> {section.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
