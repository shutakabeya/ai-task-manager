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
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              AI Task Manager
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* 開発用：テスト通知ボタン */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={showTestNotification}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors"
                  title="テスト通知を表示"
                >
                  🔔 テスト通知
                </button>
              )}
              
              {/* ビュートグルボタン */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'list'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📝 リスト
                </button>
                <button
                  onClick={() => setCurrentView('calendar')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'calendar'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' ? <TaskListView /> : <CalendarView />}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        {/* タスク追加ボタン */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110"
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