import { useState, useEffect } from 'react'
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Plus, 
  X,
  Zap,
  Heart,
  Brain,
  Dumbbell,
  BookOpen,
  RotateCcw,
  ChevronRight,
  Sun,
  Moon,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const defaultDailyTasks = [
  { id: 1, text: '静寂10分 (瞑想/深呼吸/散歩)', completed: false, icon: 'Brain', color: 'blue' },
  { id: 2, text: '深い仕事1ブロック (25-90分)', completed: false, icon: 'Zap', color: 'purple' },
  { id: 3, text: '身体を動かす (最低10分)', completed: false, icon: 'Dumbbell', color: 'green' },
  { id: 4, text: '学習15分 (英語/コード/読書)', completed: false, icon: 'BookOpen', color: 'orange' },
  { id: 5, text: '感謝/連絡1件', completed: false, icon: 'Heart', color: 'red' },
  { id: 6, text: '5分リセット (机と床をスッキリ)', completed: false, icon: 'RotateCcw', color: 'gray' }
]

const defaultWeeklyTasks = [
  { id: 1, text: '運動', current: 0, target: 4, unit: '回', color: 'green' },
  { id: 2, text: 'ふたり時間', current: 0, target: 2, unit: '回', color: 'pink' },
  { id: 3, text: '部屋リセット', current: 0, target: 1, unit: '回', color: 'purple' },
  { id: 4, text: 'お金＆画面棚卸し', current: 0, target: 1, unit: '回', color: 'blue' },
  { id: 5, text: '次週の最重要決定', current: 0, target: 1, unit: '回', color: 'orange' }
]

const iconMap = {
  Brain,
  Zap,
  Dumbbell,
  BookOpen,
  Heart,
  RotateCcw
}

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export default function Dashboard() {
  const [tasks, setTasks] = useLocalStorage('dailyTasks', defaultDailyTasks)
  const [weeklyTasks, setWeeklyTasks] = useLocalStorage('weeklyTasks', defaultWeeklyTasks)
  const [isEditing, setIsEditing] = useState(false)
  const [newTaskText, setNewTaskText] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRetractedMode, setIsRetractedMode] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  
  // 時刻を更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  // 初回読み込み時と5分ごとの自動同期
  useEffect(() => {
    // 初回読み込み時にNotionから取得
    fetchTasksFromNotion()
    fetchWeeklyGoalsFromNotion()
    
    // 5分ごとの自動同期
    const syncInterval = setInterval(() => {
      syncWithNotion()
    }, 5 * 60 * 1000) // 5分 = 300000ms
    
    return () => clearInterval(syncInterval)
  }, []) // 依存配列を空にして、初回のみ実行
  
  // Notionからタスクを取得
  const fetchTasksFromNotion = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`${API_BASE}/notion/taiki-tasks?date=${today}`)
      
      if (!response.ok) {
        console.error('Failed to fetch tasks:', response.status, response.statusText)
        return
      }
      
      const data = await response.json()
      
      if (data.success && data.tasks) {
        // Notionのタスクをローカルに反映（0件でも反映）
        const notionTasks = data.tasks.map((task, index) => ({
          id: task.notion_id || `notion-${Date.now()}-${index}`,
          text: task.name || task.title || '',
          completed: task.completed || false,
          icon: getIconFromCategory(task.category),
          color: 'gray',
          notionId: task.notion_id
        }))
        
        // Notionからデータが取得できた場合は、それを優先
        if (notionTasks.length > 0 || data.count === 0) {
          setTasks(notionTasks)
          setLastSync(new Date())
        }
      } else {
        console.error('Notion API error:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch tasks from Notion:', error)
    }
  }
  
  // Notionから週次目標を取得
  const fetchWeeklyGoalsFromNotion = async () => {
    try {
      const response = await fetch(`${API_BASE}/notion/weekly-goals`)
      
      if (!response.ok) {
        console.error('Failed to fetch weekly goals:', response.status, response.statusText)
        return
      }
      
      const data = await response.json()
      
      if (data.success && data.goals) {
        // Notionの週次目標をローカルに反映（0件でも反映）
        const notionGoals = data.goals.map((goal, index) => ({
          id: goal.notion_id || `notion-goal-${Date.now()}-${index}`,
          text: goal.name || '',
          current: goal.current || 0,
          target: goal.target || 0,
          unit: goal.unit || '回',
          color: 'green',
          notionId: goal.notion_id
        }))
        
        // Notionからデータが取得できた場合は、それを優先
        if (notionGoals.length > 0 || data.count === 0) {
          setWeeklyTasks(notionGoals)
        }
      } else {
        console.error('Notion API error:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch weekly goals from Notion:', error)
    }
  }
  
  // Notionにタスクを同期
  const syncTasksToNotion = async () => {
    try {
      const response = await fetch(`${API_BASE}/notion/taiki-tasks/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks }),
      })
      if (response.ok) {
        setLastSync(new Date())
      }
    } catch (error) {
      console.error('Failed to sync tasks to Notion:', error)
    }
  }
  
  // Notionに週次目標を同期
  const syncWeeklyGoalsToNotion = async () => {
    try {
      const response = await fetch(`${API_BASE}/notion/weekly-goals/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goals: weeklyTasks }),
      })
      if (response.ok) {
        setLastSync(new Date())
      }
    } catch (error) {
      console.error('Failed to sync weekly goals to Notion:', error)
    }
  }
  
  // 双方向同期
  const syncWithNotion = async () => {
    setSyncing(true)
    try {
      // Notionから取得（最新データを取得）
      await Promise.all([
        fetchTasksFromNotion(),
        fetchWeeklyGoalsFromNotion()
      ])
      
      // Notionに送信（ローカル変更があれば）
      await Promise.all([
        syncTasksToNotion(),
        syncWeeklyGoalsToNotion()
      ])
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }
  
  // カテゴリからアイコンを取得
  const getIconFromCategory = (category) => {
    const categoryMap = {
      '静寂': 'Brain',
      '深い仕事': 'Zap',
      '運動': 'Dumbbell',
      '学習': 'BookOpen',
      '感謝': 'Heart',
      'リセット': 'RotateCcw'
    }
    return categoryMap[category] || 'Circle'
  }
  
  const toggleTask = async (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setTasks(updatedTasks)
    // Notionに即座に同期
    await syncTasksToNotion()
  }
  
  const addTask = async () => {
    if (newTaskText.trim()) {
      const newTask = {
        id: Date.now(),
        text: newTaskText.trim(),
        completed: false,
        icon: 'Circle',
        color: 'gray'
      }
      setTasks([...tasks, newTask])
      setNewTaskText('')
      // Notionに同期
      await syncTasksToNotion()
    }
  }
  
  const removeTask = async (taskId) => {
    const taskToRemove = tasks.find(t => t.id === taskId)
    setTasks(tasks.filter(task => task.id !== taskId))
    // Notionからも削除（notionIdがある場合）
    if (taskToRemove?.notionId) {
      try {
        await fetch(`${API_BASE}/notion/taiki-tasks/${taskToRemove.notionId}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.error('Failed to delete task from Notion:', error)
      }
    }
  }
  
  const updateWeeklyTask = async (taskId, field, value) => {
    const updatedWeeklyTasks = weeklyTasks.map(task =>
      task.id === taskId ? { ...task, [field]: Math.max(0, value) } : task
    )
    setWeeklyTasks(updatedWeeklyTasks)
    // Notionに同期
    await syncWeeklyGoalsToNotion()
  }
  
  const resetToMinimalMode = () => {
    const minimalTasks = [
      { id: 1, text: '静寂3分', completed: false, icon: 'Brain', color: 'blue' },
      { id: 2, text: '運動3分', completed: false, icon: 'Dumbbell', color: 'green' },
      { id: 3, text: '学習3分', completed: false, icon: 'BookOpen', color: 'orange' }
    ]
    setTasks(minimalTasks)
    setIsRetractedMode(true)
  }
  
  const resetToNormalMode = () => {
    setTasks(defaultDailyTasks)
    setIsRetractedMode(false)
  }
  
  // タスク完了数の計算
  const completedTasks = tasks.filter(task => task.completed === true).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  const weeklyProgress = weeklyTasks.reduce((acc, task) => {
    const taskProgress = task.target > 0 ? task.current / task.target : 0
    return acc + taskProgress
  }, 0) / weeklyTasks.length * 100
  
  // 時間帯による挨拶
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'おはようございます'
    if (hour < 18) return 'こんにちは'
    return 'こんばんは'
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {getGreeting()}、大毅さん 
            {currentTime.getHours() < 12 ? (
              <Sun className="w-8 h-8 text-yellow-500" />
            ) : (
              <Moon className="w-8 h-8 text-blue-500" />
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentTime.toLocaleDateString('ja-JP', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {currentTime.toLocaleTimeString('ja-JP', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="text-sm text-gray-500">現在時刻</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={syncWithNotion}
            disabled={syncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同期中...' : '手動同期'}
          </Button>
          {lastSync && (
            <div className="text-xs text-gray-500">
              最終同期: {lastSync.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {/* 今日の進捗サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">今日の進捗</h3>
              <p className="text-3xl font-bold text-blue-700 mt-2">{progressPercentage}%</p>
              <p className="text-blue-600 text-sm">{completedTasks}/{totalTasks} タスク完了</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Target className="w-8 h-8 text-blue-700" />
            </div>
          </div>
          <div className="mt-4 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">今週の進捗</h3>
              <p className="text-3xl font-bold text-green-700 mt-2">{Math.round(weeklyProgress)}%</p>
              <p className="text-green-600 text-sm">週間目標達成率</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-700" />
            </div>
          </div>
          <div className="mt-4 bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 今日の目標 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">今日の目標（Taiki Task）</h2>
                <p className="text-gray-600 text-sm">
                  {isRetractedMode ? '縮退モード - 最小限のタスク' : 'Life OS - 毎日のやるべきこと'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                {isEditing ? '完了' : '編集'}
              </Button>
              
              {isRetractedMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToNormalMode}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  通常モードに戻る
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToMinimalMode}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  縮退モードに切り替え
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {tasks.map((task) => {
              const IconComponent = iconMap[task.icon] || Circle
              
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                    task.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleTask(task.id)}
                >
                  <button className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  
                  <div className={`p-2 rounded-lg ${task.completed ? 'bg-green-200' : 'bg-blue-100'}`}>
                    <IconComponent className={`w-5 h-5 ${task.completed ? 'text-green-700' : 'text-blue-600'}`} />
                  </div>
                  
                  <div className="flex-1">
                    <span className={`font-medium ${task.completed ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                      {task.text}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeTask(task.id)
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <ChevronRight className={`w-5 h-5 ${task.completed ? 'text-green-400' : 'text-gray-400'}`} />
                  </div>
                </div>
              )
            })}
            
            {isEditing && (
              <div className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="新しいタスクを追加..."
                  className="flex-1 outline-none bg-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
                <Button size="sm" onClick={addTask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">進捗</span>
              <span className="text-sm font-bold text-gray-900">{completedTasks}/{totalTasks} 完了</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* 今週の目標 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">今週の目標（Weekly Goals）</h2>
              <p className="text-gray-600 text-sm">週のやるべきこと</p>
            </div>
          </div>

          <div className="space-y-4">
            {weeklyTasks.map((task) => (
              <div key={task.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{task.text}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateWeeklyTask(task.id, 'current', task.current - 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-sm font-bold text-gray-900 min-w-[60px] text-center">
                      {task.current}/{task.target}{task.unit}
                    </span>
                    <button
                      onClick={() => updateWeeklyTask(task.id, 'current', task.current + 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <Progress 
                  value={task.target > 0 ? Math.min((task.current / task.target) * 100, 100) : 0} 
                  className="h-2" 
                />
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-700">総合進捗</span>
              <span className="text-sm font-bold text-purple-900">{Math.round(weeklyProgress)}%</span>
            </div>
            <div className="mt-2 bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
