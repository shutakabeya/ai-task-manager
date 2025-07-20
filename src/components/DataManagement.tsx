'use client'

import { useState, useRef } from 'react'
import { useTaskStore } from '../types/taskStore'
import { storageUtils } from '../utils/storage'
import { toast } from 'react-toastify'

export default function DataManagement() {
  const { tasks, clearAllTasks, importTasks, exportTasks } = useTaskStore()
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const tasksToExport = exportTasks()
    if (tasksToExport.length === 0) {
      toast.warning('エクスポートするタスクがありません')
      return
    }
    
    storageUtils.exportTasksAsFile(tasksToExport)
    toast.success(`${tasksToExport.length}件のタスクをエクスポートしました`)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const importedTasks = await storageUtils.importTasksFromFile(file)
      importTasks(importedTasks)
      toast.success(`${importedTasks.length}件のタスクをインポートしました`)
    } catch (error) {
      toast.error('ファイルのインポートに失敗しました')
      console.error('Import error:', error)
    }

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClear = () => {
    if (window.confirm('すべてのタスクを削除しますか？この操作は元に戻せません。')) {
      clearAllTasks()
      toast.success('すべてのタスクを削除しました')
    }
  }

  const getStorageInfo = () => {
    const usage = storageUtils.getStorageUsage()
    const usedKB = Math.round(usage.used / 1024)
    const totalKB = Math.round(usage.total / 1024)
    const percentage = Math.round((usage.used / usage.total) * 100)
    
    return { usedKB, totalKB, percentage }
  }

  const storageInfo = getStorageInfo()

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 w-12 h-12 sm:w-14 sm:h-14 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-medium flex items-center justify-center text-lg sm:text-xl transition-all duration-200 ease-out hover:scale-110 hover:shadow-strong"
        aria-label="データ管理"
        title="データ管理"
      >
        ⚙️
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* 背景オーバーレイ */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />

        {/* モーダルコンテンツ */}
        <div className="modal-base inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-strong transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full animate-scaleIn">
          {/* ヘッダー */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-600 bg-opacity-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-text">
                  データ管理
                </h3>
                <div className="mt-2 space-y-4">
                  {/* ストレージ情報 */}
                  <div className="card-white p-3 sm:p-4 animate-slideIn">
                    <h4 className="text-sm font-medium text-text mb-2">ストレージ使用量</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>使用中:</span>
                        <span>{storageInfo.usedKB}KB / {storageInfo.totalKB}KB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${storageInfo.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {storageInfo.percentage}% 使用中
                      </div>
                    </div>
                  </div>

                  {/* タスク情報 */}
                  <div className="card-white p-3 sm:p-4 bg-blue-50 border-blue-200 animate-slideIn">
                    <h4 className="text-sm font-medium text-text mb-2">タスク情報</h4>
                    <div className="text-xs sm:text-sm text-gray-600">
                      <div>総タスク数: {tasks.length}件</div>
                      <div>サブタスク数: {tasks.reduce((sum, task) => sum + task.subtasks.length, 0)}件</div>
                    </div>
                  </div>

                  {/* 操作ボタン */}
                  <div className="space-y-3 animate-slideIn">
                    {/* エクスポート */}
                    <button
                      onClick={handleExport}
                      disabled={tasks.length === 0}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📤 タスクをエクスポート
                    </button>

                    {/* インポート */}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary w-full"
                      >
                        📥 タスクをインポート
                      </button>
                    </div>

                    {/* クリア */}
                    <button
                      onClick={handleClear}
                      disabled={tasks.length === 0}
                      className="btn-danger w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🗑️ すべてのタスクを削除
                    </button>
                  </div>

                  {/* 注意事項 */}
                  <div className="text-xs text-gray-500 space-y-1 animate-slideIn">
                    <p>• エクスポート: タスクデータをJSONファイルとしてダウンロード</p>
                    <p>• インポート: JSONファイルからタスクデータを読み込み</p>
                    <p>• 削除: すべてのタスクを完全に削除（元に戻せません）</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* アクションボタン */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-secondary w-full sm:w-auto"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 