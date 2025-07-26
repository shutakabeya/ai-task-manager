'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { useTaskStore } from '../types/taskStore'
import { Task, Subtask } from '../types/task'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { DraggableTaskItem } from './DraggableTaskItem'
import { DroppableDateCell } from './DroppableDateCell'
import { DragHandle } from './DragHandle'

type ViewMode = 'week' | 'month'

export default function CalendarView() {
  const { tasks } = useTaskStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDateModal, setShowDateModal] = useState(false)
  const { draggedItem, handleDragStart, handleDragEnd } = useDragAndDrop()

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

  // 月の日付を取得
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // 月の最初の日
    const firstDay = new Date(year, month, 1)
    // 月の最後の日
    const lastDay = new Date(year, month + 1, 0)
    
    // 週の開始日（日曜日）
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())
    
    // 週の終了日（土曜日）
    const endDate = new Date(lastDay)
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()))
    
    const dates = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  // 指定された日付のサブタスクを取得
  const getSubtasksForDate = (date: Date): { task: Task; subtask: Subtask }[] => {
    const dateString = date.toISOString().split('T')[0]
    const result: { task: Task; subtask: Subtask }[] = []
    
    tasks.forEach(task => {
      // メインタスクの日時をチェック
      if (task.datetime) {
        const taskDate = new Date(task.datetime).toISOString().split('T')[0]
        if (taskDate === dateString) {
          // メインタスクに日時がある場合、サブタスクがない場合はダミーのサブタスクを作成
          if (task.subtasks.length === 0) {
            result.push({
              task,
              subtask: {
                id: task.id,
                title: task.title,
                datetime: task.datetime,
                estimatedTime: task.estimatedTime,
                category: task.category,
                completed: false
              }
            })
          }
        }
      }
      
      // サブタスクの日時をチェック
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

  const getCategoryColor = (category: string, completed: boolean) => {
    if (completed) {
      return 'bg-gray-400'
    }
    
    // カテゴリ名からハッシュ値を生成して色を決定
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-cyan-500'
    ]
    
    return colors[Math.abs(hash) % colors.length]
  }

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getEstimatedTimeDisplay = (estimatedTime?: string) => {
    if (!estimatedTime) return ''
    return estimatedTime
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowDateModal(true)
  }

  const closeDateModal = () => {
    setShowDateModal(false)
    setSelectedDate(null)
  }

  // 日付モーダルコンポーネント
  const DateModal = () => {
    if (!selectedDate || !showDateModal) return null

    const subtasks = getSubtasksForDate(selectedDate)
    const dateString = selectedDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={closeDateModal}
      >
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{dateString}</h3>
            <button
              onClick={closeDateModal}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* タスク一覧 */}
          <div className="p-4">
            {subtasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">この日のタスクはありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subtasks.map(({ task, subtask }) => (
                  <div
                    key={subtask.id}
                    className={`p-3 rounded-lg border border-gray-200 ${getCategoryColor(task.category, subtask.completed)} text-white transition-all ${
                      subtask.completed ? 'opacity-75' : ''
                    }`}
                  >
                    <div className={`font-medium ${subtask.completed ? 'line-through' : ''}`}>
                      {subtask.title}
                    </div>
                    <div className="text-sm opacity-90 mt-1">
                      {formatTime(subtask.datetime!)}
                      {subtask.estimatedTime && ` (${subtask.estimatedTime})`}
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {task.title} - {subtask.category || task.category}
                    </div>
                    {subtask.memo && (
                      <div className="text-xs opacity-75 mt-1 line-clamp-1">
                        📝 {subtask.memo}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 animate-fadeIn">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-text mb-2">スケジュールがありません</h3>
        <p className="text-sm sm:text-base text-gray-500">タスクを作成して日時を設定すると、ここに表示されます</p>
      </div>
    )
  }

  // 週表示コンポーネント
  const WeekView = () => {
    const weekDates = getWeekDates(currentDate)

    return (
      <DndContext 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
        modifiers={[]}
      >
        <div className="space-y-4 sm:space-y-6 animate-fadeIn">
          {/* ナビゲーション */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setDate(currentDate.getDate() - 7)
                setCurrentDate(newDate)
              }}
              className="btn-secondary p-1 sm:p-2 text-sm sm:text-base"
            >
              ← 前週
            </button>
            
            <h3 className="text-base sm:text-lg font-medium text-text">
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
            </h3>
            
            <button
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setDate(currentDate.getDate() + 7)
                setCurrentDate(newDate)
              }}
              className="btn-secondary p-1 sm:p-2 text-sm sm:text-base"
            >
              次週 →
            </button>
          </div>

          {/* カレンダーグリッド */}
          <div className="card-white overflow-hidden">
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
                  <DroppableDateCell
                    key={index}
                    id={`date-${date.toISOString()}`}
                    date={date}
                  >
                    <div
                      className={`min-h-24 sm:min-h-32 border-r border-gray-200 last:border-r-0 ${
                        isToday ? 'bg-blue-50' : ''
                      }`}
                    >
                      {/* 日付 */}
                      <div className={`p-1 sm:p-2 text-xs sm:text-sm font-medium ${
                        isToday ? 'text-primary' : 'text-text'
                      }`}>
                        {date.getDate()}
                      </div>

                      {/* サブタスク */}
                      <div className="p-1 sm:p-2 space-y-1">
                        {subtasks.map(({ task, subtask }) => (
                          <DraggableTaskItem
                            key={subtask.id}
                            id={subtask.id}
                            type="subtask"
                            taskId={task.id}
                            subtaskId={subtask.id}
                            isDragging={draggedItem?.subtaskId === subtask.id}
                            showDragHandle={true}
                            onRenderDragHandle={(listeners, attributes) => (
                              <DragHandle listeners={listeners} attributes={attributes} className="text-white opacity-75" />
                            )}
                          >
                            <div
                              className={`p-1 sm:p-2 rounded text-xs text-white ${getCategoryColor(task.category, subtask.completed)} transition-all duration-150 ease-out hover:scale-[1.02] ${
                                subtask.completed ? 'opacity-75' : ''
                              }`}
                              title={`${task.title} - ${subtask.title}${subtask.completed ? ' (完了)' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className={`font-medium truncate ${subtask.completed ? 'line-through' : ''}`}>
                                    {subtask.title}
                                  </div>
                                  <div className="text-xs opacity-90">
                                    {formatTime(subtask.datetime!)}
                                    {subtask.estimatedTime && ` (${subtask.estimatedTime})`}
                                  </div>
                                  {subtask.category && (
                                    <div className="text-xs opacity-75 mt-1">
                                      {subtask.category}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DraggableTaskItem>
                        ))}
                      </div>
                    </div>
                  </DroppableDateCell>
                )
              })}
            </div>
          </div>
        </div>
      </DndContext>
    )
  }

  // 月表示コンポーネント
  const MonthView = () => {
    const monthDates = getMonthDates(currentDate)

    return (
      <DndContext 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
        modifiers={[]}
      >
        <div className="space-y-4 sm:space-y-6 animate-fadeIn">
          {/* ナビゲーション */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setMonth(currentDate.getMonth() - 1)
                setCurrentDate(newDate)
              }}
              className="btn-secondary p-1 sm:p-2 text-sm sm:text-base"
            >
              ← 前月
            </button>
            
            <h3 className="text-base sm:text-lg font-medium text-text">
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
            </h3>
            
            <button
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setMonth(currentDate.getMonth() + 1)
                setCurrentDate(newDate)
              }}
              className="btn-secondary p-1 sm:p-2 text-sm sm:text-base"
            >
              次月 →
            </button>
          </div>

          {/* カレンダーグリッド */}
          <div className="card-white overflow-hidden">
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
              {monthDates.map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString()
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const subtasks = getSubtasksForDate(date)
                
                return (
                  <DroppableDateCell
                    key={index}
                    id={`date-${date.toISOString()}`}
                    date={date}
                  >
                    <div
                      className={`min-h-20 sm:min-h-24 border-r border-gray-200 last:border-r-0 ${
                        isToday ? 'bg-blue-50' : ''
                      } ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
                    >
                      {/* 日付 */}
                      <div className={`p-1 sm:p-2 text-xs sm:text-sm font-medium ${
                        isToday ? 'text-primary' : !isCurrentMonth ? 'text-gray-400' : 'text-text'
                      }`}>
                        {date.getDate()}
                      </div>

                      {/* サブタスク */}
                      <div className="p-1 space-y-0.5">
                        {subtasks.slice(0, 3).map(({ task, subtask }) => (
                          <DraggableTaskItem
                            key={subtask.id}
                            id={subtask.id}
                            type="subtask"
                            taskId={task.id}
                            subtaskId={subtask.id}
                            isDragging={draggedItem?.subtaskId === subtask.id}
                            showDragHandle={true}
                            onRenderDragHandle={(listeners, attributes) => (
                              <DragHandle listeners={listeners} attributes={attributes} className="text-white opacity-75" />
                            )}
                          >
                            <div
                              className={`p-1 rounded text-xs text-white ${getCategoryColor(task.category, subtask.completed)} transition-all duration-150 ease-out hover:scale-[1.02] ${
                                subtask.completed ? 'opacity-75' : ''
                              }`}
                              title={`${task.title} - ${subtask.title}${subtask.completed ? ' (完了)' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className={`font-medium truncate ${subtask.completed ? 'line-through' : ''}`}>
                                    {subtask.title}
                                  </div>
                                  <div className="text-xs opacity-90">
                                    {formatTime(subtask.datetime!)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DraggableTaskItem>
                        ))}
                        {subtasks.length > 3 && (
                          <div className="text-xs text-gray-500 text-center p-1">
                            +{subtasks.length - 3}件
                          </div>
                        )}
                      </div>
                    </div>
                  </DroppableDateCell>
                )
              })}
            </div>
          </div>
        </div>
      </DndContext>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-semibold text-text">カレンダー</h2>
        
        {/* ビューモード切り替え */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto shadow-sm">
          <button
            onClick={() => setViewMode('week')}
            className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all duration-150 ease-out ${
              viewMode === 'week'
                ? 'bg-white text-primary shadow-soft scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            週表示
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all duration-150 ease-out ${
              viewMode === 'month'
                ? 'bg-white text-primary shadow-soft scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            月表示
          </button>
        </div>
      </div>

      {/* ビューコンテンツ */}
      {viewMode === 'week' ? <WeekView /> : <MonthView />}

      {/* 凡例 */}
      <div className="card-white p-3 sm:p-4">
        <h4 className="text-sm sm:text-base font-medium text-text mb-2 sm:mb-3">凡例</h4>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* 実際に使用されているカテゴリを表示 */}
          {(() => {
            const usedCategories = new Set<string>()
            tasks.forEach(task => {
              usedCategories.add(task.category)
              task.subtasks.forEach(subtask => {
                if (subtask.category) {
                  usedCategories.add(subtask.category)
                }
              })
            })
            
            return Array.from(usedCategories).slice(0, 6).map(category => (
              <div key={category} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded ${getCategoryColor(category, false)}`}></div>
                <span className="text-xs sm:text-sm text-gray-600">{category}</span>
              </div>
            ))
          })()}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">完了</span>
          </div>
        </div>
      </div>

      {/* 日付モーダル */}
      <DateModal />
    </div>
  )
} 