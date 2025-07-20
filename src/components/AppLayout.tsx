'use client'

import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import TaskListView from './TaskListView'
import CalendarView from './CalendarView'
import AddTaskModal from './AddTaskModal'
import DataManagement from './DataManagement'
import { useReminder } from '../hooks/useReminder'
import { useTaskStore } from '../types/taskStore'
import { exampleTasks } from '../types/exampleTaskData'

type ViewType = 'list' | 'calendar'

export default function AppLayout() {
  const { tasks, addTask } = useTaskStore()
  const [currentView, setCurrentView] = useState<ViewType>('list')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // リマインド機能を有効化
  useReminder()

  // 開発用：初期データの読み込み（初回のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && tasks.length === 0) {
      exampleTasks.forEach(task => {
        addTask(task)
      })
    }
  }, [tasks.length, addTask])

  // 開発用：テスト通知を表示
  const showTestNotification = () => {
    toast.info(
      '🔔『テストタスク』の時間が近づいています！（あと10分）',
      {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      }
    )
  }

  return (
    <div className="min-h-screen bg-background animate-fadeIn">
      {/* ヘッダー */}
      <header className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-0 sm:h-16 space-y-3 sm:space-y-0">
            {/* タイトル */}
            <h1 className="text-xl sm:text-2xl font-bold text-text text-center sm:text-left animate-slideIn">
              AI Task Manager
            </h1>
            
            {/* コントロールエリア */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* 開発用：テスト通知ボタン */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={showTestNotification}
                  className="btn-secondary px-2 py-1 text-xs sm:text-sm"
                  title="テスト通知を表示"
                >
                  🔔 テスト
                </button>
              )}
              
              {/* ビュートグルボタン - スマートフォンで1行に収める */}
              <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto shadow-sm">
                <button
                  onClick={() => setCurrentView('list')}
                  className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 ease-out ${
                    currentView === 'list'
                      ? 'bg-white text-primary shadow-soft scale-[1.02]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  📝 リマインダー
                </button>
                <button
                  onClick={() => setCurrentView('calendar')}
                  className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 ease-out ${
                    currentView === 'calendar'
                      ? 'bg-white text-primary shadow-soft scale-[1.02]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  📅 カレンダー
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 animate-slideUp">
        {currentView === 'list' ? <TaskListView /> : <CalendarView />}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 flex flex-col space-y-3 animate-bounceIn">
        {/* タスク追加ボタン */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-medium flex items-center justify-center text-xl sm:text-2xl transition-all duration-200 ease-out hover:scale-110 hover:shadow-strong"
          aria-label="タスクを追加"
        >
          +
        </button>
      </div>

      {/* データ管理ボタン */}
      <DataManagement />

      {/* タスク追加モーダル */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* トースト通知コンテナ */}
      <ToastContainer />
    </div>
  )
} 