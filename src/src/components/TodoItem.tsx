import type { Todo } from "../types/todo";
import { ImportanceBadge } from "./ImportanceBadge";

interface TodoItemProps {
  todo: Todo;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggleDone: (todo: Todo) => void;
  onSelect: (todo: Todo) => void;
  onMove: (todo: Todo, direction: "up" | "down") => void;
}

export function TodoItem({
  todo,
  canMoveUp,
  canMoveDown,
  onToggleDone,
  onSelect,
  onMove,
}: TodoItemProps) {
  return (
    <li
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-blue-300"
      onClick={() => onSelect(todo)}
    >
      <input
        type="checkbox"
        className="mt-1 size-4 shrink-0"
        checked={todo.is_done}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onToggleDone(todo)}
      />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm text-slate-800">
          {todo.todo}
        </p>
        {todo.limit_date && (
          <p className="mt-1 text-xs text-slate-500">期限: {todo.limit_date}</p>
        )}
      </div>
      <ImportanceBadge importance={todo.importance} />
      <div className="flex shrink-0 flex-col gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="rounded border border-slate-200 px-1 text-xs text-slate-500 disabled:opacity-30"
          disabled={!canMoveUp}
          onClick={() => onMove(todo, "up")}
        >
          ▲
        </button>
        <button
          type="button"
          className="rounded border border-slate-200 px-1 text-xs text-slate-500 disabled:opacity-30"
          disabled={!canMoveDown}
          onClick={() => onMove(todo, "down")}
        >
          ▼
        </button>
      </div>
    </li>
  );
}
