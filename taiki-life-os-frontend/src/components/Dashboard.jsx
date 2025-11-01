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
  Clock,
  Zap,
  Heart,
  Brain,
  Dumbbell,
  BookOpen,
  MessageCircle,
  RotateCcw,
  ChevronRight,
  Star,
  Award,
  Sun,
  Moon
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

const defaultMetrics = [
  { id: 1, text: '深い仕事1ブロック', days: [false, false, false, false, false, false, false] },
  { id: 2, text: '運動(10分以上)', days: [false, false, false, false, false, false, false] },
  { id: 3, text: '学習(15分以上)', days: [false, false, false, false, false, false, false] },
  { id: 4, text: 'SNS45分以内', days: [false, false, false, false, false, false, false] },
  { id: 5, text: '感謝1回', days: [false, false, false, false, false, false, false] }
]

const iconMap = {
  Brain,
  Zap,
  Dumbbell,
  BookOpen,
  Heart,
  RotateCcw
}

export default function Dashboard() {
  const [tasks, setTasks] = useLocalStorage('dailyTasks', defaultDailyTasks)
  const [weeklyTasks, setWeeklyTasks] = useLocalStorage('weeklyTasks', defaultWeeklyTasks)
  const [metrics, setMetrics] = useLocalStorage('metrics', defaultMetrics)
  const [isEditing, setIsEditing] = useState(false)
  const [newTaskText, setNewTaskText] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRetractedMode, setIsRetractedMode] = useState(false)
  
  // 時刻を更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  // デバッグ用: タスクの状態をコンソールに出力
  useEffect(() => {
    console.log('Current tasks:', tasks)
    console.log('Completed tasks count:', tasks.filter(task => task.completed).length)
  }, [tasks])
  
  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }
  
  const addTask = () => {
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
    }
  }
  
  const removeTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }
  
  const updateWeeklyTask = (taskId, field, value) => {
    setWeeklyTasks(weeklyTasks.map(task =>
      task.id === taskId ? { ...task, [field]: Math.max(0, value) } : task
    ))
  }
  
  const toggleMetricDay = (metricId, dayIndex) => {
    setMetrics(metrics.map(metric =>
      metric.id === metricId 
        ? {
            ...metric,
            days: metric.days.map((day, index) =>
              index === dayIndex ? !day : day
            )
          }
        : metric
    ))
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
  
  // タスク完了数の計算を確実に行う
  const completedTasks = tasks.filter(task => task.completed === true).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  const weeklyProgress = weeklyTasks.reduce((acc, task) => {
    const taskProgress = task.target > 0 ? task.current / task.target : 0
    return acc + taskProgress
  }, 0) / weeklyTasks.length * 100
  
  // クイックアクション関数
  const handleTimerStart = () => {
    const duration = prompt('タイマーの時間を分で入力してください（例: 25）', '25')
    if (duration && !isNaN(duration)) {
      const minutes = parseInt(duration)
      alert(`${minutes}分のタイマーを開始しました！\n\n集中して作業に取り組みましょう。`)
      
      // 実際のタイマー機能（簡易版）
      setTimeout(() => {
        if (confirm('タイマーが終了しました！\n\n作業は完了しましたか？')) {
          // 深い仕事タスクを自動で完了にする
          const deepWorkTask = tasks.find(task => task.text.includes('深い仕事'))
          if (deepWorkTask && !deepWorkTask.completed) {
            toggleTask(deepWorkTask.id)
          }
        }
      }, minutes * 60 * 1000)
    }
  }
  
  const handleGratitudeMessage = () => {
    const message = prompt('今日感謝したいことを入力してください：')
    if (message && message.trim()) {
      alert(`感謝メッセージを記録しました：\n\n"${message.trim()}"\n\n素晴らしい気持ちですね！`)
      
      // 感謝タスクを自動で完了にする
      const gratitudeTask = tasks.find(task => task.text.includes('感謝'))
      if (gratitudeTask && !gratitudeTask.completed) {
        toggleTask(gratitudeTask.id)
      }
    }
  }
  
  const handleLearningRecord = () => {
    const options = ['英語学習', 'プログラミング', '読書', 'その他']
    const choice = prompt(`学習内容を選択してください：\n\n1. ${options[0]}\n2. ${options[1]}\n3. ${options[2]}\n4. ${options[3]}\n\n番号を入力してください（1-4）：`)
    
    if (choice && choice >= '1' && choice <= '4') {
      const selectedOption = options[parseInt(choice) - 1]
      const duration = prompt(`${selectedOption}の学習時間を分で入力してください：`, '15')
      
      if (duration && !isNaN(duration)) {
        alert(`${selectedOption}を${duration}分学習しました！\n\n継続は力なり。素晴らしいです！`)
        
        // 学習タスクを自動で完了にする
        const learningTask = tasks.find(task => task.text.includes('学習'))
        if (learningTask && !learningTask.completed) {
          toggleTask(learningTask.id)
        }
      }
    }
  }
  
  const handleReset = () => {
    if (confirm('5分リセットを開始しますか？\n\n机と床を「見えてスッキリ」状態にしましょう！')) {
      alert('5分リセット開始！\n\n1. 机の上を整理\n2. 床の物を片付け\n3. ゴミを捨てる\n4. 必要な物だけ残す\n\n頑張って！')
      
      // 5分後にリマインダー
      setTimeout(() => {
        if (confirm('5分経過しました！\n\nリセットは完了しましたか？')) {
          // リセットタスクを自動で完了にする
          const resetTask = tasks.find(task => task.text.includes('リセット'))
          if (resetTask && !resetTask.completed) {
            toggleTask(resetTask.id)
          }
        }
      }, 5 * 60 * 1000)
    }
  }
  
  const metricsScore = metrics.reduce((acc, metric) => {
    return acc + metric.days.filter(day => day).length
  }, 0)
  
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
        </div>
      </div>

      {/* 今日の進捗サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900">今週のスコア</h3>
              <p className="text-3xl font-bold text-purple-700 mt-2">{metricsScore}/35</p>
              <p className="text-purple-600 text-sm">軽量メトリクス</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Award className="w-8 h-8 text-purple-700" />
            </div>
          </div>
          <div className="flex items-center mt-4 gap-1">
            {[...Array(Math.min(7, Math.floor(metricsScore / 5)))].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-purple-600 fill-current" />
            ))}
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
                <h2 className="text-xl font-bold text-gray-900">今日の目標</h2>
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
              <h2 className="text-xl font-bold text-gray-900">今週の目標</h2>
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

      {/* クイックアクション */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={handleTimerStart}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Clock className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">タイマー開始</span>
          </button>
          <button 
            onClick={handleGratitudeMessage}
            className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-900">感謝メッセージ</span>
          </button>
          <button 
            onClick={handleLearningRecord}
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <BookOpen className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">学習記録</span>
          </button>
          <button 
            onClick={handleReset}
            className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <RotateCcw className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">リセット</span>
          </button>
        </div>
      </div>
      
      {/* 軽量メトリクス */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">軽量メトリクス (今週)</h2>
            <p className="text-gray-600 text-sm">週20/35以上で良い週</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 min-w-[120px]">
                {metric.text}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {metric.days.map((completed, dayIndex) => (
                    <button
                      key={dayIndex}
                      onClick={() => toggleMetricDay(metric.id, dayIndex)}
                      className={`w-6 h-6 rounded border-2 transition-colors ${
                        completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm font-bold text-gray-900 min-w-[3rem]">
                  {metric.days.filter(day => day).length}/7
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">今週の合計スコア</span>
            <span className="text-lg font-bold text-blue-900">{metricsScore}/35</span>
          </div>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(metricsScore / 35) * 100}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {metricsScore >= 20 ? '🎉 良い週です！' : `あと${20 - metricsScore}ポイントで良い週に到達`}
          </p>
        </div>
      </div>
    </div>
  )
}

