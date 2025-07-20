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

    // サブタスクにIDを付与
    const subtasksWithIds = subtasks.map((subtask, index) => ({
      ...subtask,
      id: `subtask-${Date.now()}-${index}`,
      completed: false
    }))

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      subtasks: subtasksWithIds
    }

    addTask(newTask)
    
    // フォームをリセット
    setFormData({ title: '', category: '', naturalText: '' })
    setSubtasks([])
    setError('')
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

      // AI生成されたサブタスクを初期化
      const initialSubtasks = (data.subtasks || []).map((subtask: any) => ({
        id: '',
        title: subtask.title,
        datetime: undefined,
        estimatedTime: '',
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
    newSubtasks[index] = { ...newSubtasks[index], [field]: value }
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">新しいタスク</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* カテゴリ */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            >
              <option value="">カテゴリを選択</option>
              <option value="仕事">仕事</option>
              <option value="プライベート">プライベート</option>
              <option value="学習">学習</option>
            </select>
          </div>

          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="タスクのタイトルを入力"
              required
            />
          </div>

          {/* 自然文入力（AI分解用） */}
          <div>
            <label htmlFor="naturalText" className="block text-sm font-medium text-gray-700 mb-2">
              AI分解用（オプション）
            </label>
            <textarea
              id="naturalText"
              value={formData.naturalText}
              onChange={(e) => handleInputChange('naturalText', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="やりたいことを自然に書いてください（AIがサブタスクを自動生成します）"
            />
            <div className="mt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleGptDecompose}
                disabled={isLoading || !formData.naturalText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '処理中...' : 'GPTで分解'}
              </button>
              <p className="text-xs text-gray-500">
                AIが自然文からサブタスクを自動生成します
              </p>
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* サブタスク一覧 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                サブタスク
              </label>
              <button
                type="button"
                onClick={handleSubtaskAdd}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                + 手動追加
              </button>
            </div>
            
            {subtasks.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-400 mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-3">サブタスクがありません</p>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={handleSubtaskAdd}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    手動で追加
                  </button>
                  <span className="text-xs text-gray-400">または</span>
                  <span className="text-xs text-gray-400">上記でAI分解を使用</span>
                </div>
              </div>
            )}
            
            {subtasks.length > 0 && (
              <div className="space-y-3">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border border-gray-200 rounded-lg">
                    {/* タイトル */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={subtask.title}
                        onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="タイトル"
                        required
                      />
                    </div>
                    
                    {/* 日時 */}
                    <div className="col-span-3">
                      <DatePicker
                        selected={subtask.datetime ? new Date(subtask.datetime) : null}
                        onChange={(date) => handleSubtaskChange(index, 'datetime', date ? date.toISOString() : undefined)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy/MM/dd HH:mm"
                        placeholderText="日時を選択"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    
                    {/* 所要時間 */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={subtask.estimatedTime}
                        onChange={(e) => handleSubtaskChange(index, 'estimatedTime', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="1.5h"
                      />
                    </div>
                    
                    {/* カテゴリ */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={subtask.category || ''}
                        onChange={(e) => handleSubtaskChange(index, 'category', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="カテゴリ"
                      />
                    </div>
                    
                    {/* 削除ボタン */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleSubtaskDelete(index)}
                        className="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ボタン */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 