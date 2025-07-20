'use client'

import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useTaskStore } from '../types/taskStore'
import { Task, SubTask } from '../types/task'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const addTask = useTaskStore(state => state.addTask)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    naturalText: '',
    datetime: '',
    estimatedTime: '',
  })
  const [subtasks, setSubtasks] = useState<SubTask[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.category.trim()) {
      setError('タイトルとカテゴリは必須です')
      return
    }

    if (subtasks.length === 0) {
      setError('サブタスクを1つ以上追加してください')
      return
    }

    // サブタスクにIDを付与し、カテゴリが空の場合はメインタスクのカテゴリを適用
    const subtasksWithIds = subtasks.map((subtask, index) => ({
      ...subtask,
      id: `subtask-${Date.now()}-${index}`,
      completed: false,
      category: subtask.category || formData.category // カテゴリが空の場合はメインタスクのカテゴリを適用
    }))

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      datetime: formData.datetime || undefined,
      estimatedTime: formData.estimatedTime || undefined,
      subtasks: subtasksWithIds
    }

    addTask(newTask)
    
    // フォームをリセット
    setFormData({ title: '', category: '', naturalText: '', datetime: '', estimatedTime: '' })
    setSubtasks([])
    setError('')
    onClose()
  }

  const handleInputChange = (field: string, value: string | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value || '' }))
  }

  const handleGptDecompose = async () => {
    if (!formData.naturalText.trim()) {
      setError('自然文を入力してください')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/gpt-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: formData.naturalText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'AIの処理に失敗しました')
      }

      // AI生成されたサブタスクを初期化（カテゴリは空にして、メインタスクのカテゴリを適用）
      const initialSubtasks = (data.subtasks || []).map((subtask: any) => ({
        id: '',
        title: subtask.title,
        datetime: undefined,
        estimatedTime: '',
        category: '', // 空にして、メインタスクのカテゴリを適用
        completed: false
      }))
      
      setSubtasks(initialSubtasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AIの処理に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubtaskChange = (index: number, field: keyof SubTask, value: any) => {
    const newSubtasks = [...subtasks]
    newSubtasks[index] = { ...newSubtasks[index], [field]: value || '' }
    setSubtasks(newSubtasks)
  }

  const handleSubtaskDelete = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index))
  }

  const handleSubtaskAdd = () => {
    setSubtasks([...subtasks, { 
      id: '', 
      title: '', 
      datetime: undefined, 
      estimatedTime: '', 
      category: '', // 空にして、メインタスクのカテゴリを適用
      completed: false 
    }])
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* 背景オーバーレイ */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity animate-fadeIn"
              onClick={onClose}
            />

            {/* モーダルコンテンツ */}
            <div className="modal-base inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-strong transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-scaleIn">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary bg-opacity-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-text">
                      新しいタスクを作成
                    </h3>
                    <div className="mt-2">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* メインタスク */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-text">メインタスク</h4>
                          
                          {/* タイトル */}
                          <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                              タイトル *
                            </label>
                            <input
                              type="text"
                              id="title"
                              value={formData.title}
                              onChange={(e) => handleInputChange('title', e.target.value)}
                              className="input-base w-full px-3 py-2 text-sm"
                              placeholder="タスクのタイトルを入力"
                              required
                            />
                          </div>

                          {/* カテゴリ */}
                          <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                              カテゴリ
                            </label>
                            <input
                              type="text"
                              id="category"
                              value={formData.category}
                              onChange={(e) => handleInputChange('category', e.target.value)}
                              className="input-base w-full px-3 py-2 text-sm"
                              placeholder="カテゴリを入力（例：仕事、プライベート）"
                            />
                          </div>

                          {/* 予想時間 */}
                          <div>
                            <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
                              予想時間
                            </label>
                            <div className="relative">
                              <select
                                value={formData.estimatedTime || ''}
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (value === 'custom') {
                                    // カスタムが選択された場合、入力フィールドを表示
                                    handleInputChange('estimatedTime', '')
                                  } else {
                                    handleInputChange('estimatedTime', value)
                                  }
                                }}
                                className="input-base w-full px-2 py-1 text-sm appearance-none"
                              >
                                <option value="">予想時間（任意）</option>
                                <option value="15分">15分</option>
                                <option value="30分">30分</option>
                                <option value="1時間">1時間</option>
                                <option value="2時間">2時間</option>
                                <option value="custom">カスタム</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                            {/* カスタム時間入力フィールド */}
                            {(formData.estimatedTime === '' || formData.estimatedTime === 'custom') && (
                              <input
                                type="text"
                                value={formData.estimatedTime === 'custom' ? '' : formData.estimatedTime}
                                onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                                className="input-base w-full px-2 py-1 text-sm"
                                placeholder="カスタム時間を入力（例：45分、1.5時間、90分）"
                              />
                            )}
                          </div>

                          {/* 日時 */}
                          <div>
                            <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
                              日時（後で入力可能）
                            </label>
                            <DatePicker
                              selected={formData.datetime ? new Date(formData.datetime) : null}
                              onChange={(date) => handleInputChange('datetime', date ? date.toISOString() : undefined)}
                              showTimeSelect
                              timeFormat="HH:mm"
                              timeIntervals={15}
                              dateFormat="yyyy/MM/dd HH:mm"
                              className="input-base w-full px-3 py-2 text-sm"
                              placeholderText="日時を選択（後で設定可能）"
                              isClearable
                            />
                          </div>

                          {/* 説明 */}
                          <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                              説明
                            </label>
                            <textarea
                              id="description"
                              value={formData.naturalText}
                              onChange={(e) => handleInputChange('naturalText', e.target.value)}
                              rows={3}
                              className="input-base w-full px-3 py-2 text-sm"
                              placeholder="タスクの詳細説明"
                            />
                          </div>
                        </div>

                        {/* サブタスク */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-text">サブタスク</h4>
                            <button
                              type="button"
                              onClick={handleSubtaskAdd}
                              className="btn-secondary px-2 py-1 text-xs"
                            >
                              + 追加
                            </button>
                          </div>
                          
                          {subtasks.map((subtask, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2 animate-slideIn">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-600">サブタスク {index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleSubtaskDelete(index)}
                                  className="text-red-500 hover:text-red-700 text-xs transition-all duration-150 ease-out hover:scale-110"
                                >
                                  削除
                                </button>
                              </div>
                              
                              <input
                                type="text"
                                value={subtask.title || ''}
                                onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                                className="input-base w-full px-2 py-1 text-sm"
                                placeholder="サブタスクのタイトル"
                                required
                              />
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={subtask.category || ''}
                                  onChange={(e) => handleSubtaskChange(index, 'category', e.target.value)}
                                  className="input-base w-full px-2 py-1 text-sm"
                                  placeholder="カテゴリ（空欄でメインタスクのカテゴリを継承）"
                                />
                                <div className="relative">
                                  <select
                                    value={subtask.estimatedTime || ''}
                                    onChange={(e) => {
                                      const value = e.target.value
                                      if (value === 'custom') {
                                        // カスタムが選択された場合、入力フィールドを表示
                                        handleSubtaskChange(index, 'estimatedTime', '')
                                      } else {
                                        handleSubtaskChange(index, 'estimatedTime', value)
                                      }
                                    }}
                                    className="input-base w-full px-2 py-1 text-sm appearance-none"
                                  >
                                    <option value="">予想時間（任意）</option>
                                    <option value="15分">15分</option>
                                    <option value="30分">30分</option>
                                    <option value="1時間">1時間</option>
                                    <option value="2時間">2時間</option>
                                    <option value="custom">カスタム</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              
                              {/* カスタム時間入力フィールド */}
                              {(subtask.estimatedTime === '' || subtask.estimatedTime === 'custom') && (
                                <input
                                  type="text"
                                  value={subtask.estimatedTime === 'custom' ? '' : subtask.estimatedTime}
                                  onChange={(e) => handleSubtaskChange(index, 'estimatedTime', e.target.value)}
                                  className="input-base w-full px-2 py-1 text-sm"
                                  placeholder="カスタム時間を入力（例：45分、1.5時間、90分）"
                                />
                              )}
                              
                              <DatePicker
                                selected={subtask.datetime ? new Date(subtask.datetime) : null}
                                onChange={(date) => handleSubtaskChange(index, 'datetime', date ? date.toISOString() : undefined)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy/MM/dd HH:mm"
                                className="input-base w-full px-2 py-1 text-sm"
                                placeholderText="日時を選択（後で設定可能）"
                                isClearable
                              />
                            </div>
                          ))}
                        </div>

                        {/* AI生成ボタン */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={handleGptDecompose}
                            disabled={isLoading || !formData.naturalText.trim()}
                            className="btn-secondary px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? '処理中...' : '🤖 AIでサブタスク生成'}
                          </button>
                          
                          {isLoading && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              <span>AIがサブタスクを生成中...</span>
                            </div>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* アクションボタン */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={!formData.title.trim() || isLoading}
                  className="btn-primary w-full sm:w-auto sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  タスクを作成
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 