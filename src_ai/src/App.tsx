import { useCallback, useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { TodoTabs } from "./components/TodoTabs";
import { TodoList } from "./components/TodoList";
import { TodoFormDialog } from "./components/TodoFormDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { addTodo, deleteTodo, listTodos, reorderTodos, updateTodo } from "./lib/ipc";
import type { Todo, TodoInput } from "./types/todo";

type Tab = "active" | "done";
type DialogState = { mode: "add" } | { mode: "edit"; todo: Todo } | null;

function App() {
  const [tab, setTab] = useState<Tab>("active");
  const [activeTodos, setActiveTodos] = useState<Todo[]>([]);
  const [doneTodos, setDoneTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);

  const reload = useCallback(async () => {
    try {
      const [active, done] = await Promise.all([
        listTodos(false),
        listTodos(true),
      ]);
      setActiveTodos(active);
      setDoneTodos(done);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);
  useEffect(() => {
    const unlisten = listen("todos://changed", () => {
      reload();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [reload]);


  const currentTodos = tab === "active" ? activeTodos : doneTodos;

  async function handleToggleDone(todo: Todo) {
    try {
      await updateTodo(todo.id, {
        todo: todo.todo,
        isDone: !todo.is_done,
        limitDate: todo.limit_date,
        importance: todo.importance,
      });
      await reload();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleMove(todo: Todo, direction: "up" | "down") {
    const list = tab === "active" ? activeTodos : doneTodos;
    const index = list.findIndex((t) => t.id === todo.id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapWith < 0 || swapWith >= list.length) return;

    const reordered = [...list];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    try {
      await reorderTodos(tab === "done", reordered.map((t) => t.id));
      await reload();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleSubmit(input: TodoInput) {
    try {
      if (dialog?.mode === "edit") {
        await updateTodo(dialog.todo.id, input);
      } else {
        await addTodo(input);
      }
      setDialog(null);
      await reload();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteTodo(deleteTarget.id);
      setDeleteTarget(null);
      setDialog(null);
      await reload();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    }
  }

  const dialogInitial = useMemo(
    () => (dialog?.mode === "edit" ? dialog.todo : null),
    [dialog],
  );

  return (
    <main className="flex h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-800">MyTodo</h1>
        <button
          type="button"
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          onClick={() => setDialog({ mode: "add" })}
        >
          + 追加
        </button>
      </header>

      <TodoTabs
        active={tab}
        activeCount={activeTodos.length}
        doneCount={doneTodos.length}
        onChange={setTab}
      />

      {errorMessage && (
        <p className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      )}

      <section className="flex-1 overflow-y-auto p-4">
        <TodoList
          todos={currentTodos}
          onToggleDone={handleToggleDone}
          onSelect={(todo) => setDialog({ mode: "edit", todo })}
          onMove={handleMove}
        />
      </section>

      {dialog && (
        <TodoFormDialog
          initial={dialogInitial}
          onCancel={() => setDialog(null)}
          onSubmit={handleSubmit}
          onDelete={
            dialog.mode === "edit" ? () => setDeleteTarget(dialog.todo) : undefined
          }
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="このタスクを削除しますか？この操作は取り消せません。"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  );
}

export default App;
