'use client'

import { useState, useEffect } from 'react'
import { Task, Subtask } from '../types/task'
import { useTaskStore } from '../types/taskStore'
import { toast } from 'react-toastify'

interface TaskEditModalProps {
  task: Task | null
  subtask: { task: Task; subtask: Subtask } | null
  isOpen: boolean
  onClose: () => void
}

export default function TaskEditModal({ task, subtask, isOpen, onClose }: TaskEditModalProps) {
  const { updateTask, updateSubtask, deleteTask, deleteSubtask } = useTaskStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
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
        toast.success('カテゴリを更新しました')
      } else if (subtask) {
        // サブタスク更新
        const updatedSubtask: Subtask = {
          ...subtask.subtask,
          title: formData.title.trim(),
          category: formData.category || undefined,
          datetime: formData.datetime || undefined,
          estimatedTime: formData.estimatedTime || undefined
        }
        updateSubtask(subtask.task.id, subtask.subtask.id, updatedSubtask)
        toast.success('タスクを更新しました')
      }
      onClose()
    } catch (error) {
      toast.error('更新に失敗しました')
      console.error('Update error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      if (task) {
        // タスク削除
        deleteTask(task.id)
        toast.success('カテゴリを削除しました')
      } else if (subtask) {
        // サブタスク削除
        deleteSubtask(subtask.task.id, subtask.subtask.id)
        toast.success('タスクを削除しました')
      }
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      toast.error('削除に失敗しました')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
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
  const modalTitle = isEditingTask ? 'カテゴリ編集' : 'タスク編集'
  const submitButtonText = isSubmitting ? '更新中...' : '保存'
  const deleteButtonText = isDeleting ? '削除中...' : '削除'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* 背景オーバーレイ */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity animate-fadeIn"
          onClick={onClose}
        />

        {/* 削除確認ダイアログ */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">削除の確認</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                {isEditingTask ? 'このカテゴリを削除しますか？' : 'このタスクを削除しますか？'}
                <br />
                <span className="font-medium text-red-600">この操作は取り消せません。</span>
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleteButtonText}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* メインモーダル */}
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
                className="text-white hover:text-blue-100 transition-colors flex-shrink-0 ml-3 p-2"
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
                  className="input-base w-full text-base py-3"
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
                  className="input-base w-full text-base py-3"
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
                  className="input-base w-full text-base py-3"
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
                  className="input-base w-full text-base py-3"
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
                    className="input-base w-full h-24 resize-none text-base py-3"
                    placeholder="元の自然文入力内容"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </form>
          
          {/* アクションボタン */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-between">
              {/* 削除ボタン */}
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting || isDeleting}
                className="btn-danger w-full sm:w-auto px-6 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="inline-block w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                削除
              </button>

              {/* 保存・キャンセルボタン */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting || isDeleting}
                  className="btn-secondary w-full sm:w-auto px-6 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isDeleting || !formData.title.trim()}
                  className="btn-primary w-full sm:w-auto px-6 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="inline-block w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {submitButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 