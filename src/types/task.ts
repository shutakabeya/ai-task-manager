export type Subtask = {
  id: string;
  title: string;
  datetime?: string;        // ISO形式
  estimatedTime?: string;   // e.g. "1.5h"
  category?: string;        // サブタスクのカテゴリ
  completed: boolean;
  memo?: string;            // メモ（任意）
};

export type Task = {
  id: string;
  title: string;
  category: string;
  date: string;             // タスクの日付（ISO形式）
  datetime?: string;        // メインタスクの日時（ISO形式）
  estimatedTime?: string;   // メインタスクの予想時間
  originalText: string;     // 元の自然文入力内容
  subtasks: Subtask[];
  memo?: string;            // メモ（任意）
}; 