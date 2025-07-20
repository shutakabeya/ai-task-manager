import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { useTaskStore } from '../types/taskStore'

export const useReminder = () => {
  const { tasks } = useTaskStore()
  const notifiedSubtasks = useRef<Set<string>>(new Set())

  // 指定日時の10分前かどうかをチェック
  const isWithin10Minutes = (datetime: string, now: Date): boolean => {
    const taskTime = new Date(datetime)
    const timeDiff = taskTime.getTime() - now.getTime()
    const tenMinutes = 10 * 60 * 1000 // 10分をミリ秒で
    
    // 10分前から0分前の間
    return timeDiff >= 0 && timeDiff <= tenMinutes
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      
      tasks.forEach(task => {
        task.subtasks.forEach(subtask => {
          if (
            subtask.datetime &&
            !subtask.completed &&
            !notifiedSubtasks.current.has(subtask.id) &&
            isWithin10Minutes(subtask.datetime, now)
          ) {
            // 通知を表示
            toast.info(
              `🔔『${subtask.title}』の時間が近づいています！（あと10分）`,
              {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              }
            )
            
            // 通知済みとして記録
            notifiedSubtasks.current.add(subtask.id)
          }
        })
      })
    }, 60000) // 1分ごとにチェック

    return () => clearInterval(interval)
  }, [tasks])

  // タスクが削除された場合のクリーンアップ
  useEffect(() => {
    const currentSubtaskIds = new Set<string>()
    
    tasks.forEach(task => {
      task.subtasks.forEach(subtask => {
        currentSubtaskIds.add(subtask.id)
      })
    })

    // 存在しないサブタスクの通知記録を削除
    notifiedSubtasks.current.forEach(id => {
      if (!currentSubtaskIds.has(id)) {
        notifiedSubtasks.current.delete(id)
      }
    })
  }, [tasks])
} 