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
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 flex-1">{task.title}</h3>
        <button
          onClick={() => handleDeleteTask(task.id)}
          className="text-gray-400 hover:text-red-600 transition ml-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {task.area && (
        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mb-2">
          {task.area}
        </span>
      )}

      <div className="flex gap-2 mt-3">
        {task.status !== 'today' && task.status !== 'done' && (
          <button
            onClick={() => handleMoveTask(task.id, 'today')}
            className="flex-1 px-3 py-1.5 text-xs bg-black text-white rounded hover:bg-gray-800 transition"
          >
            → Today
          </button>
        )}
        {task.status !== 'done' && (
          <button
            onClick={() => handleMoveTask(task.id, 'done')}
            className="flex-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            ✓ Done
          </button>
        )}
        {task.status === 'done' && (
          <button
            onClick={() => handleMoveTask(task.id, 'inbox')}
            className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
        >
          + New Task
        </button>
      </div>

      {/* Kanbanボード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* INBOX */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">INBOX</h2>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              {inboxTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {inboxTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                タスクがありません
              </div>
            ) : (
              inboxTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>

        {/* TODAY */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">TODAY</h2>
            <span className="px-2 py-1 bg-black text-white text-sm rounded-full">
              {todayTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                今日のタスクがありません
              </div>
            ) : (
              todayTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>

        {/* DONE */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">DONE</h2>
            <span className="px-2 py-1 bg-green-100 text-green-600 text-sm rounded-full">
              {doneTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {doneTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                完了したタスクがありません
              </div>
            ) : (
              doneTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>
      </div>

      {/* 新規タスクモーダル */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タスク名 *
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="タスクを入力..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  エリア（任意）
                </label>
                <input
                  type="text"
                  value={newTaskArea}
                  onChange={(e) => setNewTaskArea(e.target.value)}
                  placeholder="例: Work, Personal, Learning..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowNewTaskModal(false);
                    setNewTaskTitle('');
                    setNewTaskArea('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTaskTitle.trim() || creating}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                    !newTaskTitle.trim() || creating
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {creating ? '作成中...' : '作成'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ヒント */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 タスク管理のコツ</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• INBOXは24時間以内に処理しましょう（目標: 滞留ゼロ）</li>
          <li>• TODAYには本当に今日やるべきタスクだけを入れましょう</li>
          <li>• 一点集中：最重要タスクを前倒しで終わらせましょう</li>
        </ul>
      </div>
    </div>
  );
}

export default Tasks;
