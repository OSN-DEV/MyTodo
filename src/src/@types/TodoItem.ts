/**
 * Todoの情報
 */
interface TodoItem {
    id: string; // unique key (UUID, backend-assigned)
    todo: string; // Todo
    importance: "low" | "medium" | "high"; // importance,
    memo: string; // details of todo (frontend only, not persisted)
    limitDate: string | null; // due date, YYYY-MM-DD format, null if not set
    order: number; // unique, item order
    completedAt: number | null; // set when todo is complete . unix time
    createdAt: number; // create date. unix time
    modifiedAt: number; // modified date. unix time,
}