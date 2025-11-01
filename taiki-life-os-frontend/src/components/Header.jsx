import { Menu, Target, Settings, Edit3, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

export default function Header({ onMenuToggle, editMode, setEditMode, activeSection }) {
  const canEdit = activeSection === 'life-plan' || activeSection === 'current-self';
  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-900">
            Taiki Life OS
          </h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Noise-Free Edition
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {canEdit && (
          <Button 
            variant={editMode ? "default" : "ghost"} 
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className={editMode ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
          >
            {editMode ? (
              <>
                <Eye className="h-4 w-4 mr-1" />
                表示モード
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-1" />
                編集モード
              </>
            )}
          </Button>
        )}
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

