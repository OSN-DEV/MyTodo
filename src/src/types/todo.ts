export type Importance = "low" | "medium" | "high";

/** Todoの永続化項目（docs/data-schema.md のタスク項目に対応） */
export interface Todo {
  id: string;
  is_done: boolean;
  todo: string;
  limit_date: string | null;
  importance: Importance;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  order: number;
}

export interface TodoInput {
  todo: string;
  isDone: boolean;
  limitDate: string | null;
  importance: Importance;
}
