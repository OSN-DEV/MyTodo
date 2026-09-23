import { invoke } from "@tauri-apps/api/core";

export type BackendImportance = "low" | "medium" | "high";

export interface BackendTodo {
  id: string;
  is_done: boolean;
  todo: string;
  limit_date: string | null;
  importance: BackendImportance;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  order: number;
}

export interface BackendTodoInput {
  todo: string;
  isDone: boolean;
  limitDate: string | null;
  importance: BackendImportance;
}

interface IpcError {
  code: string;
  message: string;
}

interface IpcResponse<T> {
  success: boolean;
  data: T | null;
  error: IpcError | null;
}

/** バックエンドの成功/失敗レスポンスを解いて、失敗時は例外として投げる */
async function unwrap<T>(promise: Promise<IpcResponse<T>>): Promise<T> {
  const response = await promise;
  if (!response.success || response.data === null) {
    throw new Error(response.error?.message ?? "不明なエラーが発生しました。");
  }
  return response.data;
}

export function listTodos(isDone: boolean): Promise<BackendTodo[]> {
  return unwrap(invoke<IpcResponse<BackendTodo[]>>("todos_list", { isDone }));
}

export function addTodo(input: BackendTodoInput): Promise<BackendTodo> {
  return unwrap(invoke<IpcResponse<BackendTodo>>("todos_add", { ...input }));
}

export function updateTodo(
  id: string,
  input: BackendTodoInput
): Promise<BackendTodo> {
  return unwrap(
    invoke<IpcResponse<BackendTodo>>("todos_update", { id, ...input })
  );
}

export function deleteTodo(id: string): Promise<{ id: string }> {
  return unwrap(invoke<IpcResponse<{ id: string }>>("todos_delete", { id }));
}

export function reorderTodos(
  isDone: boolean,
  ids: string[]
): Promise<BackendTodo[]> {
  return unwrap(
    invoke<IpcResponse<BackendTodo[]>>("todos_reorder", { isDone, ids })
  );
}
