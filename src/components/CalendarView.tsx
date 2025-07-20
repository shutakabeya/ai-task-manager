'use client'

import { useState } from 'react'
import { useTaskStore } from '../types/taskStore'
import { Task, SubTask } from '../types/task'

export default function CalendarView() {
  const { tasks } = useTaskStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')

  // 現在の週の日付を取得
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDates.push(day)
    }
    return weekDates
  }

  // 指定された日付のサブタスクを取得
  const getSubtasksForDate = (date: Date): { task: Task; subtask: SubTask }[] => {
    const dateString = date.toISOString().split('T')[0]
    const result: { task: Task; subtask: SubTask }[] = []
    
    tasks.forEach(task => {
      task.subtasks.forEach(subtask => {
        if (subtask.datetime) {
          const subtaskDate = new Date(subtask.datetime).toISOString().split('T')[0]
          if (subtaskDate === dateString) {
            result.push({ task, subtask })
          }
        }
      })
    })
    
    return result.sort((a, b) => {
      const timeA = new Date(a.subtask.datetime!).getTime()
      const timeB = new Date(b.subtask.datetime!).getTime()
      return timeA - timeB
    })
  }

  const weekDates = getWeekDates(currentDate)

  const getCategoryColor = (category: string, completed: boolean) => {
    if (completed) {
      return 'bg-gray-400'
    }
    
    const colors = {
      '仕事': 'bg-blue-500',
      'プライベート': 'bg-green-500',
      '学習': 'bg-purple-500',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-500'
  }

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getEstimatedTimeDisplay = (estimatedTime?: string) => {
    if (!estimatedTime) return '1h'
    return estimatedTime
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">スケジュールがありません</h3>
        <p className="text-sm sm:text-base text-gray-500">タスクを作成して日時を設定すると、ここに表示されます</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">カレンダー</h2>
        
        {/* ビューモード切り替え */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('week')}
            className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            週表示
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
              viewMode === 'day'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            日表示
          </button>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            const newDate = new Date(currentDate)
            newDate.setDate(currentDate.getDate() - 7)
            setCurrentDate(newDate)
          }}
          className="p-1 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
        >
          ← 前週
        </button>
        
        <h3 className="text-base sm:text-lg font-medium text-gray-900">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </h3>
        
        <button
          onClick={() => {
            const newDate = new Date(currentDate)
            newDate.setDate(currentDate.getDate() + 7)
            setCurrentDate(newDate)
          }}
          className="p-1 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
        >
          次週 →
        </button>
      </div>

      {/* カレンダーグリッド */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7">
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString()
            const subtasks = getSubtasksForDate(date)
            
            return (
              <div
                key={index}
                className={`min-h-24 sm:min-h-32 border-r border-gray-200 last:border-r-0 ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                {/* 日付 */}
                <div className={`p-1 sm:p-2 text-xs sm:text-sm font-medium ${
                  isToday ? 'text-primary' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>

                {/* サブタスク */}
                <div className="p-1 sm:p-2 space-y-1">
                  {subtasks.map(({ task, subtask }) => (
                    <div
                      key={subtask.id}
                      className={`p-1 sm:p-2 rounded text-xs text-white ${getCategoryColor(task.category, subtask.completed)} transition-all ${
                        subtask.completed ? 'opacity-75' : ''
                      }`}
                      title={`${task.title} - ${subtask.title}${subtask.completed ? ' (完了)' : ''}`}
                    >
                      <div className={`font-medium truncate ${subtask.completed ? 'line-through' : ''}`}>
                        {subtask.title}
                      </div>
                      <div className="text-xs opacity-90">
                        {formatTime(subtask.datetime!)}
                        {` (${getEstimatedTimeDisplay(subtask.estimatedTime)})`}
                      </div>
                      {subtask.category && (
                        <div className="text-xs opacity-75 mt-1">
                          {subtask.category}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 凡例 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">凡例</h4>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">仕事</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">プライベート</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">学習</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">完了</span>
          </div>
        </div>
      </div>
    </div>
  )
} 