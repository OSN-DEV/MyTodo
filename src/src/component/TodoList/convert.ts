import type { BackendTodo, BackendTodoInput } from "../../lib/ipc";
import type { TodoFormInput } from "./TodoFormDialog";

/** バックエンドのTodo（ISO8601文字列）をフロント用のTodoItem（epochミリ秒）に変換する */
export function toTodoItem(backend: BackendTodo): TodoItem {
  return {
    id: backend.id,
    todo: backend.todo,
    importance: backend.importance,
    memo: "",
    limitDate: backend.limit_date,
    order: backend.order,
    completedAt: backend.completed_at ? Date.parse(backend.completed_at) : null,
    createdAt: Date.parse(backend.created_at),
    modifiedAt: Date.parse(backend.updated_at),
  };
}

/** フォーム入力をバックエンドのadd/update用の入力形式に変換する */
export function toBackendInput(input: TodoFormInput): BackendTodoInput {
  return {
    todo: input.todo,
    isDone: input.isDone,
    limitDate: input.limitDate,
    importance: input.importance,
  };
}
