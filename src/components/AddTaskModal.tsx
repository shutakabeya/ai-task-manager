'use client'

import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useTaskStore } from '../types/taskStore'
import { Task, Subtask } from '../types/task'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const addTask = useTaskStore(state => state.addTask)
  const [formData, setFormData] = useState({
    title: '',
    naturalText: '',
    datetime: '',
    estimatedTime: '',
    memo: '',
  })
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showGuide, setShowGuide] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('カテゴリタイトルは必須です')
      return
    }

    if (subtasks.length === 0) {
      setError('タスクを少なくとも1つ追加してください')
      return
    }

    // サブタスクにIDを付与し、カテゴリは新カテゴリ（旧メインタスク）の名前を使用
    const subtasksWithIds = subtasks.map((subtask, index) => ({
      ...subtask,
      id: `subtask-${Date.now()}-${index}`,
      completed: false,
      category: formData.title // 新カテゴリ（旧メインタスク）の名前をカテゴリとして使用
    }))

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: formData.title,
      category: formData.title, // 新カテゴリ（旧メインタスク）の名前をカテゴリとして使用
      date: formData.datetime ? new Date(formData.datetime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      datetime: formData.datetime || undefined,
      estimatedTime: formData.estimatedTime || undefined,
      originalText: formData.naturalText || formData.title,
      memo: formData.memo || undefined,
      subtasks: subtasksWithIds
    }

    addTask(newTask)
    
    // フォームをリセット
    setFormData({ title: '', naturalText: '', datetime: '', estimatedTime: '', memo: '' })
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

      // AI生成されたサブタスクを初期化（カテゴリは新カテゴリの名前を使用）
      const initialSubtasks = (data.subtasks || []).map((subtask: any) => ({
        id: '',
        title: subtask.title,
        datetime: undefined,
        estimatedTime: '',
        category: formData.title, // 新カテゴリ（旧メインタスク）の名前をカテゴリとして使用
        completed: false,
        memo: ''
      }))
      
      setSubtasks(initialSubtasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AIの処理に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubtaskChange = (index: number, field: keyof Subtask, value: any) => {
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
      category: formData.title, // 新カテゴリ（旧メインタスク）の名前をカテゴリとして使用
      completed: false,
      memo: ''
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
            <div className="modal-base inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-strong transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-scaleIn w-full max-w-none mx-4">
              <div className="bg-white px-6 pt-6 pb-6 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-primary bg-opacity-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-8 w-8 text-white sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="mt-4 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-xl leading-6 font-medium text-text sm:text-lg">
                      新しいカテゴリを作成
                    </h3>
                    <div className="mt-4 sm:mt-2">
                      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-4">
                        {/* カテゴリ */}
                        <div className="space-y-4 sm:space-y-3">
                          {/* カテゴリタイトル */}
                          <div>
                            <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-2 sm:text-sm sm:mb-1">
                              カテゴリタイトル <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="title"
                              value={formData.title}
                              onChange={(e) => handleInputChange('title', e.target.value)}
                              className="input-base w-full px-4 py-3 text-base sm:px-3 sm:py-2 sm:text-sm"
                              placeholder="カテゴリのタイトルを入力"
                              required
                            />
                          </div>

                          {/* 説明 */}
                          <div className="relative">
                            <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-2 sm:text-sm sm:mb-1">
                              説明（AI分解用）
                              <button
                                type="button"
                                className="ml-2 text-primary hover:text-blue-700 text-lg align-middle p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                style={{ fontSize: '1.1em', verticalAlign: 'middle' }}
                                aria-label="自然文ガイドを見る"
                                onClick={() => setShowGuide(true)}
                              >
                                ？
                              </button>
                            </label>
                            <textarea
                              id="description"
                              value={formData.naturalText}
                              onChange={(e) => handleInputChange('naturalText', e.target.value)}
                              rows={4}
                              className="input-base w-full px-4 py-3 text-base sm:px-3 sm:py-2 sm:text-sm"
                              placeholder="カテゴリの説明を自然文で入力（AIでタスク分解に使用）"
                            />
                          </div>

                          {/* メモ */}
                          <div>
                            <label htmlFor="memo" className="block text-base font-medium text-gray-700 mb-2 sm:text-sm sm:mb-1">
                              メモ
                            </label>
                            <textarea
                              id="memo"
                              value={formData.memo}
                              onChange={(e) => handleInputChange('memo', e.target.value)}
                              rows={3}
                              className="input-base w-full px-4 py-3 text-base sm:px-3 sm:py-2 sm:text-sm"
                                                                placeholder="カテゴリに関するメモを入力"
                            />
                          </div>
                        </div>

                        {/* タスク */}
                        <div className="space-y-4 sm:space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-medium text-text sm:text-sm">タスク</h4>
                            <button
                              type="button"
                              onClick={handleSubtaskAdd}
                              className="btn-secondary px-4 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs"
                            >
                              + 追加
                            </button>
                          </div>
                          
                          {subtasks.map((subtask, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3 sm:p-3 sm:space-y-2 animate-slideIn">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 sm:text-xs">タスク {index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleSubtaskDelete(index)}
                                  className="text-red-500 hover:text-red-700 text-sm transition-all duration-150 ease-out hover:scale-110 sm:text-xs"
                                >
                                  削除
                                </button>
                              </div>
                              
                              <input
                                type="text"
                                value={subtask.title || ''}
                                onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                                className="input-base w-full px-4 py-3 text-base sm:px-2 sm:py-1 sm:text-sm"
                                placeholder="タスクのタイトル"
                                required
                              />
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                                <DatePicker
                                  selected={subtask.datetime ? new Date(subtask.datetime) : null}
                                  onChange={(date) => handleSubtaskChange(index, 'datetime', date ? date.toISOString() : undefined)}
                                  showTimeSelect
                                  timeFormat="HH:mm"
                                  timeIntervals={15}
                                  dateFormat="yyyy/MM/dd HH:mm"
                                  className="input-base w-full px-4 py-3 text-base sm:px-2 sm:py-1 sm:text-sm"
                                  placeholderText="日時（任意）"
                                  isClearable
                                />
                              </div>
                              
                              {/* サブタスクメモ */}
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1 sm:text-xs">
                                  メモ
                                </label>
                                <textarea
                                  value={subtask.memo || ''}
                                  onChange={(e) => handleSubtaskChange(index, 'memo', e.target.value)}
                                  rows={2}
                                  className="input-base w-full px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs"
                                  placeholder="タスクに関するメモを入力"
                                />
                              </div>
                              
                            </div>
                          ))}
                        </div>

                        {/* AI生成ボタン */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={handleGptDecompose}
                            disabled={isLoading || !formData.naturalText.trim()}
                            className="btn-secondary px-4 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed sm:px-3 sm:py-2 sm:text-sm"
                          >
                            {isLoading ? '処理中...' : '🤖 AIでタスク生成'}
                          </button>
                          
                          {isLoading && (
                            <div className="flex items-center space-x-2 text-base text-gray-500 sm:text-sm">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary sm:h-4 sm:w-4"></div>
                              <span>AIがタスクを生成中...</span>
                            </div>
                          )}
                        </div>

                        {/* エラーメッセージ */}
                        {error && (
                          <div className="text-red-600 text-base bg-red-50 p-4 rounded sm:text-sm sm:p-2">
                            {error}
                          </div>
                        )}

                        {/* アクションボタン */}
                        <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 sm:pt-4">
                          <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary w-full sm:w-auto px-6 py-3 text-base sm:px-4 sm:py-2 sm:text-sm"
                          >
                            キャンセル
                          </button>
                          <button
                            type="submit"
                            disabled={!formData.title.trim() || isLoading || subtasks.length === 0}
                            className="btn-primary w-full sm:w-auto px-6 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed sm:px-4 sm:py-2 sm:text-sm"
                          >
                            カテゴリを作成
                          </button>
                        </div>
                        {/* 必須項目注意書き */}
                        <div className="mt-3 text-sm text-gray-400 text-right sm:text-xs">
                          *がついている項目は必須です
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ガイドラインモーダル */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-strong max-w-lg w-full mx-4 p-6 relative animate-scaleIn overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setShowGuide(false)}
              aria-label="閉じる"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">🧠 タスク分解を成功させる自然文の書き方ガイド</h2>
            <div className="space-y-3 text-sm">
              <p>この欄に自然文を入力すると、AIが「やるべきこと」を実行可能なタスクに分解します。<br/>でも、精度を上げるにはコツがあります。以下のポイントを意識してみてください。</p>
              <div>
                <span className="font-bold">🎯 1. やりたいことは1つの目的（フェーズ）に絞ろう</span><br/>
                いくつもの工程をまとめて書くと、粒度がバラバラになってAIの分解も曖昧になります。<br/>
                <span className="text-red-500">❌ NG例：</span>「温泉施設で紙製品の検証をして、ヒアリングして、競合調査して製品開発する」<br/>
                → 工程が多すぎて、曖昧な分解に。<br/>
                <span className="text-green-600">✅ OK例：</span>「温泉施設の紙製品に関するニーズをヒアリングしてターゲット選定を行う」<br/>
                → 目的が1つに絞られているので、より正確な分解ができます。
              </div>
              <div>
                <span className="font-bold">🧱 2. できるだけ具体的に書こう（粒度を整えやすくするために）</span><br/>
                タスク整理がうまくいかない理由は、抽象的な内容のまま書かれていて、具体的な行動に落とし込めないことです。<br/>
                AIに丸投げせず、「こういうことをしたい」という具体性をある程度持たせてください。<br/>
                <span className="text-red-500">❌ 抽象的：</span>「SNSマーケを考える」<br/>
                <span className="text-green-600">✅ 具体的：</span>「SNSマーケの投稿企画を3パターン作成する」<br/>
                あなたが「やりたいことの中身」を具体化してくれれば、こちらがきちんと粒度を整えたタスクにして返します。
              </div>
              <div>
                <span className="font-bold">✨ 3. タスクに切られたら、自分でも見直して追加しよう</span><br/>
                AIが分解してくれたタスクをベースに、「これは抜けてるな」「これはこう表現したほうがいいな」と思ったら、あなた自身で追記・修正してください。<br/>
                タスクが並び、日時も決まった状態で目の前に出てくると、一気に“やれる感”が生まれます。<br/>
                「やる気が湧く」ための地ならしを、まずこの入力欄でしてみてください。
              </div>
              <div>
                <span className="font-bold">📌 ポイントまとめ</span>
                <table className="w-full text-xs mt-2 border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">ポイント</th>
                      <th className="border px-2 py-1">なぜ重要？</th>
                      <th className="border px-2 py-1">どう書く？</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-2 py-1">✅ 目的を1つに絞る</td>
                      <td className="border px-2 py-1">工程が多いと粒度が乱れる</td>
                      <td className="border px-2 py-1">「ヒアリングとターゲット選定を行う」</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1">✅ 具体的に書く</td>
                      <td className="border px-2 py-1">粒度を整えやすくなる</td>
                      <td className="border px-2 py-1">「3パターンの投稿企画を考える」</td>
                    </tr>
                    <tr>
                      <td className="border px-2 py-1">✅ 出力後に見直す</td>
                      <td className="border px-2 py-1">抜けやズレを補える</td>
                      <td className="border px-2 py-1">「これは足そう」「これは変更しよう」</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <span className="font-bold">💡 どんなことを書けばいいか迷ったら？</span><br/>
                モヤっとしているけど、何か進めたいこと<br/>
                やらなきゃと思っているのに先延ばししていること<br/>
                頭ではわかってるけど、どう動いていいか迷っていること<br/>
                <br/>
                👉 それを素直にこの欄に書くだけで大丈夫です。<br/>
                AIが、「今すぐ動けるやることリスト」に変えて返してくれます。
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 