import { Task } from './task'

export const exampleTasks: Task[] = [
  {
    id: "task-1",
    title: "プレゼン準備",
    category: "仕事",
    subtasks: [
      {
        id: "sub-1",
        title: "構成案作成",
        datetime: "2025-01-20T10:00:00",
        estimatedTime: "1h",
        completed: false
      },
      {
        id: "sub-2",
        title: "スライド作成",
        datetime: "2025-01-21T14:00:00",
        estimatedTime: "2h",
        completed: true
      },
      {
        id: "sub-3",
        title: "発表練習",
        datetime: "2025-01-22T16:00:00",
        estimatedTime: "1.5h",
        completed: false
      }
    ]
  },
  {
    id: "task-2",
    title: "学習計画",
    category: "学習",
    subtasks: [
      {
        id: "sub-4",
        title: "React学習",
        datetime: "2025-01-20T09:00:00",
        estimatedTime: "2h",
        completed: false
      },
      {
        id: "sub-5",
        title: "TypeScript復習",
        datetime: "2025-01-21T10:00:00",
        estimatedTime: "1h",
        completed: false
      }
    ]
  },
  {
    id: "task-3",
    title: "プライベート用事",
    category: "プライベート",
    subtasks: [
      {
        id: "sub-6",
        title: "買い物",
        datetime: "2025-01-20T15:00:00",
        estimatedTime: "1h",
        completed: false
      },
      {
        id: "sub-7",
        title: "映画鑑賞",
        datetime: "2025-01-21T19:00:00",
        estimatedTime: "2.5h",
        completed: false
      }
    ]
  },
  {
    id: "task-4",
    title: "リマインドテスト",
    category: "テスト",
    subtasks: [
      {
        id: "sub-8",
        title: "10分後のテスト",
        datetime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10分後
        estimatedTime: "30m",
        completed: false
      },
      {
        id: "sub-9",
        title: "5分後のテスト",
        datetime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5分後
        estimatedTime: "15m",
        completed: false
      }
    ]
  }
] 