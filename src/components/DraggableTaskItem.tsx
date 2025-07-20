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
  showDragHandle?: boolean
  onRenderDragHandle?: (listeners: any, attributes: any) => React.ReactNode
}

export const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
  id,
  type,
  taskId,
  subtaskId,
  children,
  isDragging = false,
  showDragHandle = false,
  onRenderDragHandle
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



  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative transition-all duration-200 ${
        isDragging ? 'scale-105 shadow-lg' : 'hover:scale-[1.02]'
      }`}
    >
      {children}
      {showDragHandle && onRenderDragHandle && (
        <div className="absolute top-1 right-1 z-10">
          {onRenderDragHandle(listeners, attributes)}
        </div>
      )}
    </div>
  )
} 