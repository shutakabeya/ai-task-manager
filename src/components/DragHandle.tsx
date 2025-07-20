import React from 'react'

interface DragHandleProps {
  className?: string
  listeners?: any
  attributes?: any
}

export const DragHandle: React.FC<DragHandleProps> = ({ className = '', listeners, attributes }) => {
  return (
    <div
      data-drag-handle="true"
      className={`flex flex-col items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing select-none ${className}`}
      title="ドラッグして移動"
      {...attributes}
      {...listeners}
      onMouseDown={(e) => {
        e.stopPropagation()
        if (listeners?.onMouseDown) {
          listeners.onMouseDown(e)
        }
      }}
      onTouchStart={(e) => {
        e.stopPropagation()
        if (listeners?.onTouchStart) {
          listeners.onTouchStart(e)
        }
      }}
    >
      <div className="flex flex-col space-y-0.5">
        <div className="w-1 h-1 bg-current rounded-full"></div>
        <div className="w-1 h-1 bg-current rounded-full"></div>
        <div className="w-1 h-1 bg-current rounded-full"></div>
      </div>
    </div>
  )
} 