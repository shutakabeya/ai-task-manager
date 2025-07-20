import React from 'react'
import { useDroppable } from '@dnd-kit/core'

interface DroppableDateCellProps {
  id: string
  date: Date
  children: React.ReactNode
  isOver?: boolean
}

export const DroppableDateCell: React.FC<DroppableDateCellProps> = ({
  id,
  date,
  children,
  isOver = false
}) => {
  const { setNodeRef, isOver: isOverCurrent } = useDroppable({
    id,
    data: {
      date
    }
  })

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isOver || isOverCurrent
          ? 'bg-blue-100 border-2 border-blue-300 scale-[1.02]'
          : 'hover:bg-gray-50'
      }`}
    >
      {children}
    </div>
  )
} 