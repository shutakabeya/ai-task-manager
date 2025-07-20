'use client'

import { useState } from 'react'
import { useTaskStore } from '../types/taskStore'
import { Task } from '../types/task'

export default function TaskListView() {
  const { tasks, toggleSubtask } = useTaskStore()
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      '仕事': 'bg-blue-100 text-blue-800',
      'プライベート': 'bg-green-100 text-green-800',
      '学習': 'bg-purple-100 text-purple-800',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">タスクがありません</h3>
        <p className="text-gray-500">新しいタスクを作成して始めましょう</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">タスク一覧</h2>
      
      {tasks.map(task => (
        <div
          key={task.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* タスクヘッダー */}
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleTaskExpansion(task.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* 進捗バー */}
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getCompletionRate(task)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.round(getCompletionRate(task))}%
                  </span>
                </div>
                
                {/* 展開アイコン */}
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
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
              </div>
            </div>
          </div>

          {/* サブタスク一覧 */}
          {expandedTasks.has(task.id) && (
            <div className="border-t border-gray-200 bg-gray-50">
              <div className="p-4 space-y-3">
                {getSortedSubtasks(task).map(subtask => (
                  <div
                    key={subtask.id}
                    className={`flex items-center space-x-3 p-3 bg-white rounded-md border border-gray-200 transition-all ${
                      subtask.completed ? 'opacity-75' : ''
                    }`}
                  >
                    {/* チェックボックス */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSubtask(task.id, subtask.id)
                      }}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors ${
                        subtask.completed
                          ? 'bg-success border-success'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {subtask.completed && (
                        <svg className="w-3 h-3 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    {/* サブタスク情報 */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        subtask.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {subtask.title}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        {subtask.datetime && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDateTime(subtask.datetime)}
                          </span>
                        )}
                        {subtask.estimatedTime && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {subtask.estimatedTime}
                          </span>
                        )}
                        {subtask.category && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {subtask.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 