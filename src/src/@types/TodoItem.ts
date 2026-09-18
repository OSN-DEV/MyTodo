/**
 * Todoの情報
 */
interface TodoItem {
    id: number; // unique key
    todo: string; // Todo
    priority: "low" | "medium" | "high"; // priority,
    memo: string; // details of todo
    order: number; // unique, item order
    completedAt: number | null; // set when todo is complete . unix time
    createdAt: number; // create date. unix time
    modifiedAt: number; // modified date. unix time,
}