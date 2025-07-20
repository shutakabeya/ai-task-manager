import { useState, useCallback } from 'react'
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { useTaskStore } from '../types/taskStore'
import { Task, Subtask } from '../types/task'

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
    console.log('Task date updated:', taskId, newDateTime)
  }, [tasks, updateTask])

  // サブタスクの日時を更新
  const updateSubtaskDateTime = useCallback((taskId: string, subtaskId: string, newDateTime: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const subtask = task.subtasks.find(s => s.id === subtaskId)
    if (!subtask) return

    const updatedSubtask: Subtask = {
      ...subtask,
      datetime: newDateTime
    }
    updateSubtask(taskId, subtaskId, updatedSubtask)
    console.log('Subtask date updated:', taskId, subtaskId, newDateTime)
  }, [tasks, updateSubtask])

  // ドラッグ開始
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current
    console.log('Drag start:', data)

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
    console.log('Drag end:', { active: active.data.current, over: over?.data.current })

    if (over && active.data.current) {
      const data = active.data.current
      const overData = over.data.current

      if (overData?.date) {
        const newDateTime = overData.date.toISOString()
        console.log('Dropping on date:', newDateTime)

        if (data.type === 'task') {
          updateTaskDateTime(data.taskId, newDateTime)
        } else if (data.type === 'subtask') {
          updateSubtaskDateTime(data.taskId, data.subtaskId, newDateTime)
        }
      }
    }

    setDraggedItem(null)
  }, [updateTaskDateTime, updateSubtaskDateTime])

  return {
    draggedItem,
    handleDragStart,
    handleDragEnd
  }
} 