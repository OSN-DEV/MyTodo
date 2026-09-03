import type { Todo } from "../types/todo";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggleDone: (todo: Todo) => void;
  onSelect: (todo: Todo) => void;
  onMove: (todo: Todo, direction: "up" | "down") => void;
}

export function TodoList({ todos, onToggleDone, onSelect, onMove }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        タスクはありません。
      </p>
    );
  }

  return (
    <ul className="flex max-h-full flex-col gap-2 overflow-y-auto p-1">
      {todos.map((todo, index) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          canMoveUp={index > 0}
          canMoveDown={index < todos.length - 1}
          onToggleDone={onToggleDone}
          onSelect={onSelect}
          onMove={onMove}
        />
      ))}
    </ul>
  );
}
