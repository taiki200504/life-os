import { Calendar, Target, BookOpen, User, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const sidebarItems = [
  {
    id: 'dashboard',
    label: '今日の目標',
    icon: Calendar,
    active: true
  },
  {
    id: 'life-os',
    label: 'Life OS ルール',
    icon: Target,
    active: false
  },
  {
    id: 'life-plan',
    label: '人生計画',
    icon: BookOpen,
    active: false
  },
  {
    id: 'settings',
    label: '設定',
    icon: Settings,
    active: false
  }
]

export default function Sidebar({ isOpen, onClose, activeSection, onSectionChange, completedTasks = 0, totalTasks = 6 }) {
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          {/* Mobile close button */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick stats */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">今日の進捗</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">完了タスク</span>
                <span className="font-medium text-green-600">{completedTasks}/{totalTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${isActive 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

