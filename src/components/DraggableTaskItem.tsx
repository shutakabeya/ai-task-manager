import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface DraggableTaskItemProps {
  id: string
  type: 'task' | 'subtask'
  taskId: string
  subtaskId?: string
  children: React.ReactNode
  isDragging?: boolean
}

export const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
  id,
  type,
  taskId,
  subtaskId,
  children,
  isDragging = false
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: {
      type,
      taskId,
      subtaskId
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    position: isDragging ? 'relative' as const : 'static' as const,
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // チェックボックスやボタンなどのインタラクティブな要素の場合はドラッグを無効化
    const target = e.target as HTMLElement
    if (target.closest('button, input, select, textarea, a')) {
      return
    }
    
    // ドラッグリスナーを適用
    if (listeners && listeners.onMouseDown) {
      listeners.onMouseDown(e)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // チェックボックスやボタンなどのインタラクティブな要素の場合はドラッグを無効化
    const target = e.target as HTMLElement
    if (target.closest('button, input, select, textarea, a')) {
      return
    }
    
    // ドラッグリスナーを適用
    if (listeners && listeners.onTouchStart) {
      listeners.onTouchStart(e)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`transition-all duration-200 ${
        isDragging ? 'scale-105 shadow-lg' : 'hover:scale-[1.02]'
      }`}
    >
      {children}
    </div>
  )
} 