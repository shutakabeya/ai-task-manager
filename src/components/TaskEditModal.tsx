'use client'

import { useState, useEffect } from 'react'
import { Task, SubTask } from '../types/task'
import { useTaskStore } from '../types/taskStore'
import { toast } from 'react-toastify'

interface TaskEditModalProps {
  task: Task | null
  subtask: { task: Task; subtask: SubTask } | null
  isOpen: boolean
  onClose: () => void
}

export default function TaskEditModal({ task, subtask, isOpen, onClose }: TaskEditModalProps) {
  const { updateTask, updateSubtask } = useTaskStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    datetime: '',
    estimatedTime: '',
    originalText: ''
  })

  // 編集対象が変更されたときにフォームをリセット
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // タスク編集
        setFormData({
          title: task.title,
          category: task.category,
          datetime: task.datetime || '',
          estimatedTime: task.estimatedTime || '',
          originalText: task.originalText
        })
      } else if (subtask) {
        // サブタスク編集
        setFormData({
          title: subtask.subtask.title,
          category: subtask.subtask.category || '',
          datetime: subtask.subtask.datetime || '',
          estimatedTime: subtask.subtask.estimatedTime || '',
          originalText: subtask.subtask.title // サブタスクにはoriginalTextがないのでtitleを使用
        })
      }
    }
  }, [isOpen, task, subtask])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('タイトルを入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      if (task) {
        // タスク更新
        const updatedTask: Task = {
          ...task,
          title: formData.title.trim(),
          category: formData.category.trim(),
          datetime: formData.datetime || undefined,
          estimatedTime: formData.estimatedTime || undefined,
          originalText: formData.originalText.trim()
        }
        updateTask(task.id, updatedTask)
        toast.success('タスクを更新しました')
      } else if (subtask) {
        // サブタスク更新
        const updatedSubtask: SubTask = {
          ...subtask.subtask,
          title: formData.title.trim(),
          category: formData.category || undefined,
          datetime: formData.datetime || undefined,
          estimatedTime: formData.estimatedTime || undefined
        }
        updateSubtask(subtask.task.id, subtask.subtask.id, updatedSubtask)
        toast.success('サブタスクを更新しました')
      }
      onClose()
    } catch (error) {
      toast.error('更新に失敗しました')
      console.error('Update error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  const isEditingTask = !!task
  const isEditingSubtask = !!subtask
  const modalTitle = isEditingTask ? 'タスク編集' : 'サブタスク編集'
  const submitButtonText = isSubmitting ? '更新中...' : '更新'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* 背景オーバーレイ */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity animate-fadeIn"
          onClick={onClose}
        />

        {/* モーダルコンテンツ */}
        <div className="modal-base inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-strong transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-white bg-opacity-20">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg leading-6 font-medium text-white truncate">
                    {modalTitle}
                  </h3>
                  <p className="text-sm text-blue-100 truncate">
                    {isEditingSubtask && subtask?.task.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition-colors flex-shrink-0 ml-3"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* タイトル */}
              <div className="animate-slideIn">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="input-base w-full"
                  placeholder="タスクのタイトルを入力"
                  required
                />
              </div>

              {/* カテゴリ */}
              <div className="animate-slideIn" style={{ animationDelay: '0.1s' }}>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="input-base w-full"
                  placeholder="カテゴリを入力（例：仕事、プライベート）"
                />
              </div>

              {/* 日時 */}
              <div className="animate-slideIn" style={{ animationDelay: '0.2s' }}>
                <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-2">
                  日時
                </label>
                <input
                  type="datetime-local"
                  id="datetime"
                  value={formData.datetime}
                  onChange={(e) => handleInputChange('datetime', e.target.value)}
                  className="input-base w-full"
                />
              </div>

              {/* 予想時間 */}
              <div className="animate-slideIn" style={{ animationDelay: '0.3s' }}>
                <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-2">
                  予想時間
                </label>
                <input
                  type="text"
                  id="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                  className="input-base w-full"
                  placeholder="例：1.5h、30m、2時間"
                />
              </div>

              {/* 自然文入力内容（タスクのみ） */}
              {isEditingTask && (
                <div className="animate-slideIn" style={{ animationDelay: '0.4s' }}>
                  <label htmlFor="originalText" className="block text-sm font-medium text-gray-700 mb-2">
                    元の文章
                  </label>
                  <textarea
                    id="originalText"
                    value={formData.originalText}
                    onChange={(e) => handleInputChange('originalText', e.target.value)}
                    className="input-base w-full h-24 resize-none"
                    placeholder="元の自然文入力内容"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </form>
          
          {/* アクションボタン */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title.trim()}
              className="btn-primary w-full sm:w-auto mb-2 sm:mb-0 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitButtonText}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary w-full sm:w-auto px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 