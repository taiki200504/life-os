import { useState } from 'react'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import LifeOS from './components/LifeOS.jsx'
import LifePlan from './components/LifePlan.jsx'
import LifePlanEditable from './components/LifePlanEditable.jsx'
import Settings from './components/Settings.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import './App.css'

const defaultDailyTasks = [
  { id: 1, text: '静寂10分 (瞑想/深呼吸/散歩)', completed: false },
  { id: 2, text: '深い仕事1ブロック (25-90分)', completed: false },
  { id: 3, text: '身体を動かす (最低10分)', completed: false },
  { id: 4, text: '学習15分 (英語/コード/読書)', completed: false },
  { id: 5, text: '感謝/連絡1件', completed: false },
  { id: 6, text: '5分リセット (机と床をスッキリ)', completed: false }
]

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [editMode, setEditMode] = useState(false)
  const [tasks] = useLocalStorage('dailyTasks', defaultDailyTasks)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleSectionChange = (section) => {
    setActiveSection(section)
    closeSidebar() // Close sidebar on mobile after selection
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />
      case 'life-os':
        return <LifeOS />
      case 'life-plan':
        return editMode ? <LifePlanEditable /> : <LifePlan />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  // タスクの完了数を計算
  const completedTasks = tasks.filter(task => task.completed === true).length
  const totalTasks = tasks.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuToggle={toggleSidebar} 
        editMode={editMode}
        setEditMode={setEditMode}
        activeSection={activeSection}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          completedTasks={completedTasks}
          totalTasks={totalTasks}
        />
        
        <main className="flex-1 lg:ml-0">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App
