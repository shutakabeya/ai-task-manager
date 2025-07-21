'use client'

import { useState } from 'react'
import { Task } from '../types/task'
import { useTaskStore } from '../types/taskStore'
import { toast } from 'react-toastify'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onEdit: (task: Task) => void
}

export default function TaskDetailModal({ task, isOpen, onClose, onEdit }: TaskDetailModalProps) {
  const { deleteTask } = useTaskStore()
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen || !task) return null

  const handleDelete = async () => {
    if (!window.confirm('このカテゴリを削除しますか？この操作は元に戻せません。')) {
      return
    }

    setIsDeleting(true)
    try {
      deleteTask(task.id)
      toast.success('カテゴリを削除しました')
      onClose()
    } catch (error) {
      toast.error('カテゴリの削除に失敗しました')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg leading-6 font-medium text-white truncate">
                    カテゴリ詳細
                  </h3>
                  <p className="text-sm text-blue-100 truncate">
                    {task.category}
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

          {/* コンテンツ */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* タイトル */}
              <div className="animate-slideIn">
                <h4 className="text-sm font-medium text-gray-500 mb-2">タイトル</h4>
                <p className="text-base sm:text-lg font-semibold text-gray-900">{task.title}</p>
              </div>

              {/* 日時 */}
              <div className="animate-slideIn" style={{ animationDelay: '0.1s' }}>
                <h4 className="text-sm font-medium text-gray-500 mb-2">日時</h4>
                <div className="flex items-center space-x-2 text-gray-900">
                  <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm sm:text-base">{formatDate(task.date)}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm sm:text-base">{formatTime(task.date)}</span>
                </div>
              </div>

              {/* 自然文入力内容 */}
              <div className="animate-slideIn" style={{ animationDelay: '0.2s' }}>
                <h4 className="text-sm font-medium text-gray-500 mb-2">元の文章</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700 text-sm leading-relaxed">{task.originalText}</p>
                </div>
              </div>

                             {/* サブタスク */}
               <div className="animate-slideIn" style={{ animationDelay: '0.3s' }}>
                 <h4 className="text-sm font-medium text-gray-500 mb-2">
                   タスク ({task.subtasks.length}件)
                 </h4>
                 {task.subtasks.length > 0 ? (
                   <div className="space-y-2">
                     {task.subtasks.map((subtask, index) => (
                       <div key={subtask.id} className="flex items-start space-x-3 bg-blue-50 rounded-lg p-3">
                         <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                           {index + 1}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm text-gray-700 font-medium break-words">{subtask.title}</p>
                           {subtask.datetime && (
                             <p className="text-xs text-gray-500 mt-1">
                               {new Date(subtask.datetime).toLocaleString('ja-JP')}
                             </p>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="bg-gray-50 rounded-lg p-3">
                     <p className="text-sm text-gray-500 text-center">タスクがありません</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
          
          {/* アクションボタン */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-between">
              {/* 削除ボタン */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-danger w-full sm:w-auto px-6 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="inline-block w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting ? '削除中...' : '削除'}
              </button>

              {/* 編集・閉じるボタン */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary w-full sm:w-auto px-6 py-3 text-base font-medium"
                >
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="btn-primary w-full sm:w-auto px-6 py-3 text-base font-medium"
                >
                  <svg className="inline-block w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  編集
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 