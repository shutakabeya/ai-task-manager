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
        className="fixed bottom-6 left-6 w-14 h-14 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center text-xl transition-all duration-200 hover:scale-110"
        aria-label="データ管理"
        title="データ管理"
      >
        ⚙️
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">データ管理</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* ストレージ情報 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">ストレージ使用量</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>使用中:</span>
                <span>{storageInfo.usedKB}KB / {storageInfo.totalKB}KB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${storageInfo.percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                {storageInfo.percentage}% 使用中
              </div>
            </div>
          </div>

          {/* タスク情報 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">タスク情報</h3>
            <div className="text-sm text-gray-600">
              <div>総タスク数: {tasks.length}件</div>
              <div>サブタスク数: {tasks.reduce((sum, task) => sum + task.subtasks.length, 0)}件</div>
            </div>
          </div>

          {/* 操作ボタン */}
          <div className="space-y-3">
            {/* エクスポート */}
            <button
              onClick={handleExport}
              disabled={tasks.length === 0}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                📥 タスクをインポート
              </button>
            </div>

            {/* クリア */}
            <button
              onClick={handleClear}
              disabled={tasks.length === 0}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ すべてのタスクを削除
            </button>
          </div>

          {/* 注意事項 */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• エクスポート: タスクデータをJSONファイルとしてダウンロード</p>
            <p>• インポート: JSONファイルからタスクデータを読み込み</p>
            <p>• 削除: すべてのタスクを完全に削除（元に戻せません）</p>
          </div>
        </div>
      </div>
    </div>
  )
} 