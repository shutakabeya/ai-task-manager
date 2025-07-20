export type SubTask = {
  id: string;
  title: string;
  datetime?: string;        // ISO形式
  estimatedTime?: string;   // e.g. "1.5h"
  category?: string;        // サブタスクのカテゴリ
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  category: string;
  estimatedTime?: string;   // メインタスクの予想時間
  subtasks: SubTask[];
}; 