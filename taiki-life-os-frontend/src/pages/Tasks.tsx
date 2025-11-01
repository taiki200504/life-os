import { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import type { Task, TaskStatus } from '../types';

function Tasks() {
  const [inboxTasks, setInboxTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskArea, setNewTaskArea] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const [inbox, today, done] = await Promise.all([
        taskService.getInboxTasks(),
        taskService.getTodayTasks(),
        taskService.getDoneTasks(20),
      ]);

      setInboxTasks(inbox.tasks);
      setTodayTasks(today.tasks);
      setDoneTasks(done.tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    setCreating(true);
    try {
      await taskService.createTask({
        title: newTaskTitle.trim(),
        status: 'inbox',
        area: newTaskArea.trim() || undefined,
      });

      setNewTaskTitle('');
      setNewTaskArea('');
      setShowNewTaskModal(false);
      await loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.moveTask(taskId, newStatus);
      await loadTasks();
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('このタスクを削除しますか？')) return;

    try {
      await taskService.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="card hover:shadow-lg transition-all duration-200 cursor-move">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex-1 leading-relaxed">{task.title}</h3>
        <button
          type="button"
          onClick={() => handleDeleteTask(task.id)}
          className="ml-3 text-gray-400 hover:text-red-600 transition p-1"
          aria-label="タスクを削除"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {task.area && (
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full mb-3">
          {task.area}
        </span>
      )}

      <div className="flex gap-2 mt-4">
        {task.status !== 'today' && task.status !== 'done' && (
          <button
            type="button"
            onClick={() => handleMoveTask(task.id, 'today')}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 active:scale-95"
          >
            → Today
          </button>
        )}
        {task.status !== 'done' && (
          <button
            type="button"
            onClick={() => handleMoveTask(task.id, 'done')}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 active:scale-95"
          >
            ✓ Done
          </button>
        )}
        {task.status === 'done' && (
          <button
            type="button"
            onClick={() => handleMoveTask(task.id, 'inbox')}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 active:scale-95"
          >
            ← Inbox
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* ヘッダー */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-600">タスクを整理して、集中しましょう</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewTaskModal(true)}
          className="btn-primary px-6 py-3 text-base"
        >
          + New Task
        </button>
      </div>

      {/* Kanbanボード */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INBOX */}
        <div>
          <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">INBOX</h2>
            <span className="badge bg-gray-100 text-gray-700 font-bold">
              {inboxTasks.length}
            </span>
          </div>
          <div className="space-y-4">
            {inboxTasks.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400 font-medium">タスクがありません</p>
                <p className="text-sm text-gray-500 mt-2">新しいタスクを追加しましょう</p>
              </div>
            ) : (
              inboxTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>

        {/* TODAY */}
        <div>
          <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-black">
            <h2 className="text-xl font-bold text-gray-900">TODAY</h2>
            <span className="badge bg-black text-white font-bold">
              {todayTasks.length}
            </span>
          </div>
          <div className="space-y-4">
            {todayTasks.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400 font-medium">今日のタスクがありません</p>
                <p className="text-sm text-gray-500 mt-2">INBOXからタスクを移動しましょう</p>
              </div>
            ) : (
              todayTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>

        {/* DONE */}
        <div>
          <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-green-500">
            <h2 className="text-xl font-bold text-gray-900">DONE</h2>
            <span className="badge badge-success font-bold">
              {doneTasks.length}
            </span>
          </div>
          <div className="space-y-4">
            {doneTasks.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400 font-medium">完了したタスクがありません</p>
                <p className="text-sm text-gray-500 mt-2">達成したタスクがここに表示されます</p>
              </div>
            ) : (
              doneTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>
      </div>

      {/* 新規タスクモーダル */}
      {showNewTaskModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setShowNewTaskModal(false)}
        >
          <div 
            className="card max-w-md w-full animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">New Task</h2>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateTask();
              }}
              className="space-y-5"
            >
              <div>
                <label htmlFor="new-task-title" className="label">
                  タスク名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="new-task-title"
                  name="new-task-title"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="タスクを入力..."
                  autoComplete="off"
                  className="input-field"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label htmlFor="new-task-area" className="label">
                  エリア（任意）
                </label>
                <input
                  id="new-task-area"
                  name="new-task-area"
                  type="text"
                  value={newTaskArea}
                  onChange={(e) => setNewTaskArea(e.target.value)}
                  placeholder="例: Work, Personal, Learning..."
                  autoComplete="off"
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTaskModal(false);
                    setNewTaskTitle('');
                    setNewTaskArea('');
                  }}
                  className="btn-secondary flex-1"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim() || creating}
                  className="btn-primary flex-1"
                >
                  {creating ? '作成中...' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
