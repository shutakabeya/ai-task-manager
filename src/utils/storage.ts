import { Task } from '../types/task'

const STORAGE_KEY = 'task-storage'

export const storageUtils = {
  // タスクを保存
  saveTasks: (tasks: Task[]): void => {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
      console.log('Tasks saved to localStorage:', tasks.length, 'tasks')
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error)
    }
  },

  // タスクを読み込み
  loadTasks: (): Task[] => {
    try {
      if (typeof window === 'undefined') return []
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const tasks = JSON.parse(stored)
        console.log('Tasks loaded from localStorage:', tasks.length, 'tasks')
        return tasks
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error)
    }
    return []
  },

  // タスクを削除
  clearTasks: (): void => {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(STORAGE_KEY)
      console.log('Tasks cleared from localStorage')
    } catch (error) {
      console.error('Failed to clear tasks from localStorage:', error)
    }
  },

  // ストレージの使用量を確認
  getStorageUsage: (): { used: number; total: number } => {
    try {
      if (typeof window === 'undefined') {
        return { used: 0, total: 0 }
      }
      const stored = localStorage.getItem(STORAGE_KEY)
      const used = stored ? new Blob([stored]).size : 0
      const total = 5 * 1024 * 1024 // 5MB (localStorageの一般的な制限)
      return { used, total }
    } catch (error) {
      console.error('Failed to get storage usage:', error)
      return { used: 0, total: 0 }
    }
  },

  // ストレージが利用可能かチェック
  isStorageAvailable: (): boolean => {
    try {
      if (typeof window === 'undefined') return false
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },

  // タスクをエクスポート（JSONファイルとしてダウンロード）
  exportTasksAsFile: (tasks: Task[]): void => {
    try {
      const dataStr = JSON.stringify(tasks, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export tasks:', error)
    }
  },

  // タスクをインポート（JSONファイルから）
  importTasksFromFile: (file: File): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const tasks = JSON.parse(content)
            if (Array.isArray(tasks)) {
              resolve(tasks)
            } else {
              reject(new Error('Invalid file format: expected array of tasks'))
            }
          } catch (error) {
            reject(new Error('Failed to parse JSON file'))
          }
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file)
      } catch (error) {
        reject(error)
      }
    })
  }
} 