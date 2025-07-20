import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Task, SubTask } from './task'

interface TaskStore {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (taskId: string, updatedTask: Task) => void
  deleteTask: (taskId: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  updateSubtask: (taskId: string, subtaskId: string, updatedSubtask: SubTask) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  clearAllTasks: () => void
  importTasks: (tasks: Task[]) => void
  exportTasks: () => Task[]
}

// カスタムストレージ（エラーハンドリング付き）
const customStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name)
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value)
    } catch (error) {
      console.error('Failed to write to localStorage:', error)
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  },
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (task) => {
        set((state) => ({
          tasks: [...state.tasks, task]
        }))
      },
      
      updateTask: (taskId, updatedTask) => {
        set((state) => ({
          tasks: state.tasks.map(task => 
            task.id === taskId ? updatedTask : task
          )
        }))
      },
      
      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== taskId)
        }))
      },
      
      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => 
                  subtask.id === subtaskId 
                    ? { ...subtask, completed: !subtask.completed }
                    : subtask
                )
              }
            }
            return task
          })
        }))
      },
      
      updateSubtask: (taskId, subtaskId, updatedSubtask) => {
        set((state) => ({
          tasks: state.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => 
                  subtask.id === subtaskId ? updatedSubtask : subtask
                )
              }
            }
            return task
          })
        }))
      },
      
      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
              }
            }
            return task
          })
        }))
      },

      clearAllTasks: () => {
        set({ tasks: [] })
      },

      importTasks: (tasks: Task[]) => {
        set({ tasks })
      },

      exportTasks: () => {
        return get().tasks
      }
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => customStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Tasks loaded from localStorage:', state.tasks.length, 'tasks')
        }
      },
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
) 