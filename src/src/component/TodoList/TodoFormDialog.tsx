import { useState } from "react";
import type { FormEvent } from "react";

const IMPORTANCE_OPTIONS: TodoItem["importance"][] = ["low", "medium", "high"];
const IMPORTANCE_LABEL: Record<TodoItem["importance"], string> = {
  low: "低",
  medium: "中",
  high: "高",
};
const MAX_TODO_LENGTH = 10000;

export interface TodoFormInput {
  todo: string;
  importance: TodoItem["importance"];
  limitDate: string | null;
  isDone: boolean;
}

interface TodoFormDialogProps {
  initial: TodoItem | null;
  onCancel: () => void;
  onSubmit: (input: TodoFormInput) => void;
  onDelete?: () => void;
}

export function TodoFormDialog({
  initial,
  onCancel,
  onSubmit,
  onDelete,
}: TodoFormDialogProps) {
  const [content, setContent] = useState(initial?.todo ?? "");
  const [importance, setImportance] = useState<TodoItem["importance"]>(
    initial?.importance ?? "medium"
  );
  const [limitDate, setLimitDate] = useState(initial?.limitDate ?? "");
  const [isDone, setIsDone] = useState(initial?.completedAt !== null && initial?.completedAt !== undefined);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (content.trim().length === 0) {
      setError("Todoの内容を入力してください。");
      return;
    }
    if (content.length > MAX_TODO_LENGTH) {
      setError(`Todoの内容は${MAX_TODO_LENGTH}文字以内で入力してください。`);
      return;
    }
    onSubmit({
      todo: content,
      importance,
      limitDate: limitDate === "" ? null : limitDate,
      isDone,
    });
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
      <form
        className="flex w-96 flex-col gap-3 rounded-lg bg-white p-4 shadow-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-base font-semibold text-slate-800">
          {initial ? "Todoを編集" : "Todoを追加"}
        </h2>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isDone}
            onChange={(e) => setIsDone(e.target.checked)}
          />
          完了
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          内容
          <textarea
            className="min-h-24 rounded border border-slate-300 p-2 text-sm text-slate-800"
            maxLength={MAX_TODO_LENGTH}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          重要度
          <select
            className="rounded border border-slate-300 p-1.5 text-sm text-slate-800"
            value={importance}
            onChange={(e) =>
              setImportance(e.target.value as TodoItem["importance"])
            }
          >
            {IMPORTANCE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {IMPORTANCE_LABEL[option]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          期限（任意）
          <input
            type="date"
            className="rounded border border-slate-300 p-1.5 text-sm text-slate-800"
            value={limitDate ?? ""}
            onChange={(e) => setLimitDate(e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="mt-2 flex items-center justify-between">
          <div>
            {onDelete && (
              <button
                type="button"
                className="rounded px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer"
                onClick={onDelete}
              >
                削除
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer"
              onClick={onCancel}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
