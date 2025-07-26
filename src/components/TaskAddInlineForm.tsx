import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTaskStore } from '../types/taskStore';
import { Task, Subtask } from '../types/task';

export default function TaskAddInlineForm({ task, onClose }: { task: Task, onClose: () => void }) {
  const { updateTask } = useTaskStore();
  const [form, setForm] = useState({ title: '', datetime: '', estimatedTime: '', memo: '' });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!form.title.trim()) return;
        const newSubtask: Subtask = {
          id: `subtask-${Date.now()}`,
          title: form.title.trim(),
          datetime: form.datetime || undefined,
          estimatedTime: form.estimatedTime || undefined,
          category: task.category,
          completed: false,
          memo: form.memo || undefined
        };
        updateTask(task.id, { ...task, subtasks: [...task.subtasks, newSubtask] });
        setForm({ title: '', datetime: '', estimatedTime: '', memo: '' });
        onClose();
      }}
      className="space-y-2"
    >
      <input
        type="text"
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        required
        className="input-base w-full px-2 py-1 text-sm"
        placeholder="タスクのタイトル"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <DatePicker
          selected={form.datetime ? new Date(form.datetime) : null}
          onChange={date => setForm(f => ({ ...f, datetime: date ? date.toISOString() : '' }))}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy/MM/dd HH:mm"
          className="input-base w-full px-2 py-1 text-sm"
          placeholderText="日時"
          isClearable
        />
      </div>
      <textarea
        value={form.memo}
        onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
        className="input-base w-full px-2 py-1 text-sm"
        placeholder="メモ"
        rows={2}
      />
      <div className="flex justify-end space-x-2 pt-1">
        <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={onClose}>
          キャンセル
        </button>
        <button type="submit" className="btn-primary px-2 py-1 text-xs" disabled={!form.title.trim()}>
          追加
        </button>
      </div>
    </form>
  );
} 