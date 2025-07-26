'use client'

import { useState } from 'react'

import { useTaskStore } from '../types/taskStore'
import { Task, Subtask } from '../types/task'

import { DragHandle } from './DragHandle'
import TaskDetailModal from './TaskDetailModal'
import TaskEditModal from './TaskEditModal'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import TaskAddInlineForm from './TaskAddInlineForm';

type ViewMode = 'date' | 'project'

export default function TaskListView() {
  const { tasks, toggleSubtask, deleteTask, deleteSubtask, updateTask } = useTaskStore()
  const [viewMode, setViewMode] = useState<ViewMode>('date')
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingSubtask, setEditingSubtask] = useState<{task: Task, subtask: Subtask} | null>(null)
  // カテゴリごとのタスク追加フォームの開閉状態と入力値を管理
  const [openAddForm, setOpenAddForm] = useState<{ [taskId: string]: boolean }>({})
  const [addFormData, setAddFormData] = useState<{ [taskId: string]: { title: string; datetime: string; estimatedTime: string } }>({})

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDetailModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditingSubtask(null)
    setIsEditModalOpen(true)
    setIsDetailModalOpen(false)
  }

  const handleEditSubtask = (task: Task, subtask: Subtask) => {
    setEditingSubtask({ task, subtask })
    setEditingTask(null)
    setIsEditModalOpen(true)
  }

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('このカテゴリを削除しますか？この操作は元に戻せません。')) {
      deleteTask(taskId)
    }
  }

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    if (window.confirm('このタスクを削除しますか？この操作は元に戻せません。')) {
      deleteSubtask(taskId, subtaskId)
    }
  }

  const getCategoryColor = (category: string) => {
    // カテゴリ名からハッシュ値を生成して色を決定
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800',
      'bg-cyan-100 text-cyan-800'
    ]
    
    return colors[Math.abs(hash) % colors.length]
  }

  const getCompletionRate = (task: Task) => {
    const completedCount = task.subtasks.filter(subtask => subtask.completed).length
    return task.subtasks.length > 0 ? (completedCount / task.subtasks.length) * 100 : 0
  }

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime)
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (datetime: string) => {
    const date = new Date(datetime)
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 日付セクションを取得
  const getDateSection = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const thisWeek = new Date(today)
    thisWeek.setDate(today.getDate() + 7)
    
    const dateString = date.toDateString()
    const todayString = today.toDateString()
    const tomorrowString = tomorrow.toDateString()
    
    if (dateString === todayString) return 'Today'
    if (dateString === tomorrowString) return 'Tomorrow'
    if (date < thisWeek) return 'This Week'
    return 'Future'
  }

  // 日付順でソートされたタスクアイテムを取得
  const getSortedTaskItems = () => {
    const items: Array<{
      id: string
      title: string
      datetime?: string
      category: string
      completed: boolean
      isSubtask: boolean
      parentTask?: string
      parentTaskId?: string
      memo?: string
    }> = []

          tasks.forEach(task => {
        // メインタスクを追加（日時がある場合のみ）
        if (task.subtasks.length === 0) {
          // サブタスクがない場合は、タスク自体をアイテムとして追加
          items.push({
            id: task.id,
            title: task.title,
            datetime: task.datetime,
            category: task.category,
            completed: false, // メインタスクは完了状態を持たない
            isSubtask: false,
            memo: task.memo
          })
        } else {
          // サブタスクを追加
          task.subtasks.forEach(subtask => {
            items.push({
              id: subtask.id,
              title: subtask.title,
              datetime: subtask.datetime,
              category: subtask.category || task.category,
              completed: subtask.completed,
              isSubtask: true,
              parentTask: task.title,
              parentTaskId: task.id,
              memo: subtask.memo
            })
          })
        }
      })

    // 日時でソート（日時がないものは最後）
    return items.sort((a, b) => {
      if (!a.datetime && !b.datetime) return 0
      if (!a.datetime) return 1
      if (!b.datetime) return -1
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    })
  }

  // 期限切れかどうかをチェック
  const isOverdue = (datetime: string): boolean => {
    const now = new Date()
    const taskDate = new Date(datetime)
    return taskDate < now
  }

  // 日付別にグループ化
  const getGroupedByDate = () => {
    const items = getSortedTaskItems()
    const groups: { [key: string]: typeof items } = {
      'Overdue': [], // 期限切れセクションを追加
      'Today': [],
      'Tomorrow': [],
      'This Week': [],
      'Future': [],
      'No Date': []
    }

    items.forEach(item => {
      if (item.datetime) {
        // 期限切れの場合はOverdueセクションに追加
        if (isOverdue(item.datetime)) {
          groups['Overdue'].push(item)
        } else {
          const section = getDateSection(new Date(item.datetime))
          groups[section].push(item)
        }
      } else {
        groups['No Date'].push(item)
      }
    })

    return groups
  }

  // サブタスクを日時順でソート
  const getSortedSubtasks = (task: Task) => {
    return [...task.subtasks].sort((a, b) => {
      if (!a.datetime && !b.datetime) return 0
      if (!a.datetime) return 1
      if (!b.datetime) return -1
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    })
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 animate-fadeIn">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-text mb-2">カテゴリがありません</h3>
        <p className="text-sm sm:text-base text-gray-500">新しいカテゴリを作成して始めましょう</p>
      </div>
    )
  }

  // 日付順ビュー
  const DateView = () => {
    const groups = getGroupedByDate()
    const sectionOrder = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Future', 'No Date']

    return (
      <div className="space-y-6 animate-fadeIn">
        {sectionOrder.map(section => {
          const items = groups[section]
          if (items.length === 0) return null

          return (
            <div key={section} className="space-y-2 animate-slideIn">
              <h3 className={`text-sm font-semibold uppercase tracking-wide ${
                section === 'Overdue' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {section === 'Overdue' && '⚠️ 期限切れ'}
                {section === 'Today' && '今日'}
                {section === 'Tomorrow' && '明日'}
                {section === 'This Week' && '今週'}
                {section === 'Future' && '将来'}
                {section === 'No Date' && '日時未設定'}
              </h3>
              <div className="space-y-1">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="transition-all duration-200"
                  >
                    <div
                      className={`task-item flex items-center space-x-3 p-3 rounded-lg border transition-all duration-150 ${
                        item.completed ? 'opacity-75' : ''
                      } ${
                        section === 'Overdue' && !item.completed
                          ? 'bg-red-50 border-red-200 hover:shadow-soft hover:border-red-300'
                          : 'bg-white border-gray-200 hover:shadow-soft'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                      data-clickable="true"
                      onMouseDown={(e) => {
                        // ドラッグハンドル以外のクリックを防ぐ
                        const target = e.target as HTMLElement
                        if (!target.closest('[data-drag-handle="true"]')) {
                          e.stopPropagation()
                        }
                      }}
                      onTouchStart={(e) => {
                        // タッチデバイスでのドラッグハンドル以外のタッチを防ぐ
                        const target = e.target as HTMLElement
                        if (!target.closest('[data-drag-handle="true"]')) {
                          e.stopPropagation()
                        }
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        
                        // ドラッグハンドルがクリックされた場合は何もしない
                        const target = e.target as HTMLElement
                        if (target.closest('[data-drag-handle="true"]')) {
                          return
                        }
                        
                        if (!item.isSubtask) {
                          const task = tasks.find(t => t.id === item.id)
                          if (task) {
                            handleTaskClick(task)
                          }
                        }
                      }}
                    >
                      {/* チェックボックス */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (item.isSubtask) {
                            // サブタスクの場合、親タスクを探してトグル
                            const parentTask = tasks.find(task => 
                              task.subtasks.some(sub => sub.id === item.id)
                            )
                            if (parentTask) {
                              toggleSubtask(parentTask.id, item.id)
                            }
                          }
                        }}
                        className={`checkbox-base flex-shrink-0 w-5 h-5 rounded border-2 ${
                          item.completed
                            ? 'bg-success border-success'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        {item.completed && (
                          <svg className="w-3 h-3 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      {/* タスク情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className={`text-sm font-medium ${
                            item.completed ? 'text-gray-500 line-through' : 
                            section === 'Overdue' ? 'text-red-700' : 'text-text'
                          }`}>
                            {item.title}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500">{item.category}</span>
                        </div>
                        
                        {/* メモ表示 */}
                        {item.memo && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-600 line-clamp-2">
                              📝 {item.memo}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* アクションボタン */}
                      <div className="flex items-center space-x-2">
                        {item.isSubtask && item.parentTaskId && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const parentTask = tasks.find(t => t.id === item.parentTaskId)
                                const subtask = parentTask?.subtasks.find(s => s.id === item.id)
                                if (parentTask && subtask) {
                                  handleEditSubtask(parentTask, subtask)
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
                              title="編集"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (item.parentTaskId) {
                                  handleDeleteSubtask(item.parentTaskId, item.id)
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                              title="削除"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // カテゴリ別ビュー
  const ProjectView = () => (
    <div className="space-y-3 sm:space-y-4">
      {tasks.map((task, taskIndex) => (
        <div
          key={task.id}
          className="transition-all duration-200"
        >
          <div
            className="card-white overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ animationDelay: `${taskIndex * 100}ms` }}
          >
            {/* カテゴリヘッダー */}
            <div
              className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-all duration-150 ease-out"
              data-clickable="true"
              onMouseDown={(e) => {
                // ドラッグハンドル以外のクリックを防ぐ
                const target = e.target as HTMLElement
                if (!target.closest('[data-drag-handle="true"]')) {
                  e.stopPropagation()
                }
              }}
              onTouchStart={(e) => {
                // タッチデバイスでのドラッグハンドル以外のタッチを防ぐ
                const target = e.target as HTMLElement
                if (!target.closest('[data-drag-handle="true"]')) {
                  e.stopPropagation()
                }
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                
                // ドラッグハンドルがクリックされた場合は何もしない
                const target = e.target as HTMLElement
                if (target.closest('[data-drag-handle="true"]')) {
                  return
                }
                
                handleTaskClick(task)
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-500">{task.category}</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base sm:text-lg font-medium text-text truncate">{task.title}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                  {/* 進捗バー */}
                  <div className="flex items-center space-x-2">
                    <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getCompletionRate(task)}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {Math.round(getCompletionRate(task))}%
                    </span>
                  </div>
                  
                  {/* アクションボタン */}
                  <div className="flex items-center space-x-2">
                    {/* ここに＋タスクを追加ボタンを追加 */}
                    <button
                      type="button"
                      className="btn-secondary px-2 py-1 text-xs"
                      onClick={e => {
                        e.stopPropagation()
                        setOpenAddForm(prev => ({ ...prev, [task.id]: !prev[task.id] }))
                        // 初回展開時はフォームを初期化
                        if (!openAddForm[task.id]) {
                          setAddFormData(prev => ({ ...prev, [task.id]: { title: '', datetime: '', estimatedTime: '' } }))
                        }
                      }}
                    >
                      ＋タスクを追加
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEditTask(task)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
                      title="編集"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteTask(task.id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                      title="削除"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    
                    {/* 展開アイコン */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleTaskExpansion(task.id)
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <svg
                        className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-all duration-150 ease-out flex-shrink-0 ${
                          expandedTasks.has(task.id) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* タスク追加フォーム（アコーディオン式） */}
            {openAddForm[task.id] && (
              <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-4">
                <TaskAddInlineForm task={task} onClose={() => setOpenAddForm(prev => ({ ...prev, [task.id]: false }))} />
              </div>
            )}
            {/* タスク一覧 */}
            {expandedTasks.has(task.id) && (
              <div className="border-t border-gray-200 bg-gray-50 animate-slideIn">
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {getSortedSubtasks(task).map((subtask, subtaskIndex) => (
                    <div
                      key={subtask.id}
                      className="transition-all duration-200"
                    >
                      <div
                        className={`task-item flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white rounded-md border border-gray-200 ${
                          subtask.completed ? 'opacity-75' : ''
                        }`}
                        style={{ animationDelay: `${subtaskIndex * 50}ms` }}
                      >
                        {/* チェックボックス */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSubtask(task.id, subtask.id)
                          }}
                          className={`checkbox-base flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 mt-0.5 ${
                            subtask.completed
                              ? 'bg-success border-success'
                              : 'border-gray-300 hover:border-primary'
                          }`}
                        >
                          {subtask.completed && (
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>

                        {/* サブタスク情報 */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            subtask.completed ? 'text-gray-500 line-through' : 'text-text'
                          }`}>
                            {subtask.title}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                            {subtask.datetime && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDateTime(subtask.datetime)}
                              </span>
                            )}
                            {subtask.estimatedTime && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {subtask.estimatedTime}
                              </span>
                            )}
                            {subtask.category && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {subtask.category}
                              </span>
                            )}
                          </div>
                          
                          {/* メモ表示 */}
                          {subtask.memo && (
                            <div className="mt-1">
                              <p className="text-xs text-gray-600 line-clamp-2">
                                📝 {subtask.memo}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* タスクアクションボタン */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditSubtask(task, subtask)
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
                            title="編集"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSubtask(task.id, subtask.id)
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                            title="削除"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-semibold text-text">タスク一覧</h2>
        
        {/* ビューモード切り替え */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto shadow-sm">
          <button
            onClick={() => setViewMode('date')}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 ease-out ${
              viewMode === 'date'
                ? 'bg-white text-primary shadow-soft scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            📅 日付順
          </button>
          <button
            onClick={() => setViewMode('project')}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 ease-out ${
              viewMode === 'project'
                ? 'bg-white text-primary shadow-soft scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            📁 カテゴリ別
          </button>
        </div>
      </div>

      {/* ビューコンテンツ */}
      {viewMode === 'date' ? <DateView /> : <ProjectView />}

      {/* カテゴリ詳細モーダル */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedTask(null)
        }}
        onEdit={handleEditTask}
      />

      {/* カテゴリ編集モーダル */}
      <TaskEditModal
        task={editingTask}
        subtask={editingSubtask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingTask(null)
          setEditingSubtask(null)
        }}
      />
    </div>
  )
} 