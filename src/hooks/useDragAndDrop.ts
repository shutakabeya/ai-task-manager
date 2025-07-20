import { useState, useCallback } from 'react'
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { useTaskStore } from '../types/taskStore'
import { Task, SubTask } from '../types/task'

export const useDragAndDrop = () => {
  const { tasks, updateTask, updateSubtask } = useTaskStore()
  const [draggedItem, setDraggedItem] = useState<{
    type: 'task' | 'subtask'
    taskId: string
    subtaskId?: string
    originalDate?: string
  } | null>(null)

  // タスクの日時を更新
  const updateTaskDateTime = useCallback((taskId: string, newDateTime: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const updatedTask: Task = {
      ...task,
      datetime: newDateTime
    }
    updateTask(taskId, updatedTask)
  }, [tasks, updateTask])

  // サブタスクの日時を更新
  const updateSubtaskDateTime = useCallback((taskId: string, subtaskId: string, newDateTime: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const subtask = task.subtasks.find(s => s.id === subtaskId)
    if (!subtask) return

    const updatedSubtask: SubTask = {
      ...subtask,
      datetime: newDateTime
    }
    updateSubtask(taskId, subtaskId, updatedSubtask)
  }, [tasks, updateSubtask])

  // ドラッグ開始
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current

    if (data?.type === 'task') {
      const task = tasks.find(t => t.id === data.taskId)
      if (task) {
        setDraggedItem({
          type: 'task',
          taskId: data.taskId,
          originalDate: task.datetime
        })
      }
    } else if (data?.type === 'subtask') {
      const task = tasks.find(t => t.id === data.taskId)
      if (task) {
        const subtask = task.subtasks.find(s => s.id === data.subtaskId)
        if (subtask) {
          setDraggedItem({
            type: 'subtask',
            taskId: data.taskId,
            subtaskId: data.subtaskId,
            originalDate: subtask.datetime
          })
        }
      }
    }
  }, [tasks])

  // ドラッグ終了
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.data.current) {
      const data = active.data.current
      const overData = over.data.current

      if (overData?.date) {
        const newDateTime = overData.date.toISOString()

        if (data.type === 'task') {
          updateTaskDateTime(data.taskId, newDateTime)
        } else if (data.type === 'subtask') {
          updateSubtaskDateTime(data.taskId, data.subtaskId, newDateTime)
        }
      }
    }

    setDraggedItem(null)
  }, [updateTaskDateTime, updateSubtaskDateTime])

  // 日付にドロップ（レガシー関数、後で削除予定）
  const handleDropOnDate = useCallback((date: Date) => {
    if (!draggedItem) return

    const newDateTime = date.toISOString()

    if (draggedItem.type === 'task') {
      updateTaskDateTime(draggedItem.taskId, newDateTime)
    } else if (draggedItem.type === 'subtask' && draggedItem.subtaskId) {
      updateSubtaskDateTime(draggedItem.taskId, draggedItem.subtaskId, newDateTime)
    }

    setDraggedItem(null)
  }, [draggedItem, updateTaskDateTime, updateSubtaskDateTime])

  return {
    draggedItem,
    handleDragStart,
    handleDragEnd,
    handleDropOnDate
  }
} 