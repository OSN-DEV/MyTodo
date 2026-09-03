import { invoke } from "@tauri-apps/api/core";
import type { IpcResponse } from "../types/ipc";
import type { Todo, TodoInput } from "../types/todo";

/** バックエンドの成功/失敗レスポンスを解いて、失敗時は例外として投げる */
async function unwrap<T>(promise: Promise<IpcResponse<T>>): Promise<T> {
  const response = await promise;
  if (!response.success) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export function listTodos(isDone: boolean): Promise<Todo[]> {
  return unwrap(invoke<IpcResponse<Todo[]>>("todos_list", { isDone }));
}

export function addTodo(input: TodoInput): Promise<Todo> {
  return unwrap(invoke<IpcResponse<Todo>>("todos_add", { ...input }));
}

export function updateTodo(id: string, input: TodoInput): Promise<Todo> {
  return unwrap(invoke<IpcResponse<Todo>>("todos_update", { id, ...input }));
}

export function deleteTodo(id: string): Promise<{ id: string }> {
  return unwrap(invoke<IpcResponse<{ id: string }>>("todos_delete", { id }));
}

export function reorderTodos(isDone: boolean, ids: string[]): Promise<Todo[]> {
  return unwrap(
    invoke<IpcResponse<Todo[]>>("todos_reorder", { isDone, ids }),
  );
}
