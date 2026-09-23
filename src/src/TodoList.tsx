import { useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
// import "./TodoList.css";
import "./component/TodoList/style.css";
import { EmojiButton } from "./component/TodoList/EmojiButton";
import { TodoFormDialog } from "./component/TodoList/TodoFormDialog";
import type { TodoFormInput } from "./component/TodoList/TodoFormDialog";
import { toBackendInput, toTodoItem } from "./component/TodoList/convert";
import { addTodo, deleteTodo, listTodos, reorderTodos, updateTodo } from "./lib/ipc";

// 追加ダイアログか、対象idを持つ編集ダイアログか。未表示の場合はnull。
type DialogState = { mode: "add" } | { mode: "edit"; id: string } | null;

function App() {
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // View > Complete Todo メニューのトグル状態。初期値は非表示。
  const [showCompleted, setShowCompleted] = useState(false);

  // バックエンドから未完了・完了の両方を取得し、フロント用の形式に変換して保持する。
  const loadTodos = async () => {
    try {
      const [active, done] = await Promise.all([
        listTodos(false),
        listTodos(true),
      ]);
      setTodoItems([...active, ...done].map(toTodoItem));
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  // Rust側のメニュークリックを購読し、クリックのたびに表示/非表示を反転する。
  useEffect(() => {
    const unlisten = listen("menu://toggle-complete-todo", () => {
      setShowCompleted((prev) => !prev);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // バックエンド側でのデータ変更（追加・更新・削除・並べ替え・期限切れ削除）を都度反映する。
  useEffect(() => {
    const unlisten = listen("todos://changed", () => {
      loadTodos();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // １行分の情報をドラッグするのでdraggableはliタグに対して設定する必要がある。
  // ただしドラック開始はノブをクリックしたときに限定したいので、ノブのクリック時にドラッグを許可する。
  const [grabbedIndex, setGrabbedIndex] = useState<number | null>(null);
  // ドラッグ中の元インデックスとプレビュー先インデックス。todoItems自体はドロップ時まで変更しない。
  const [dragSrcIndex, setDragSrcIndex] = useState<number | null>(null);
  const [dragDestIndex, setDragDestIndex] = useState<number | null>(null);

  // =====================================================================================
  // リスト並べ替え関連
  // =====================================================================================
  // fromの要素をtoの位置へ移動した新しい配列を返す（引数の配列自体は変更しない）。
  const reorderList = (list: TodoItem[], from: number, to: number) => {
    const updated = [...list];
    const [draggedItem] = updated.splice(from, 1);
    updated.splice(to, 0, draggedItem);
    return updated;
  };

  // 現在の表示対象（showCompletedに応じたフィルタ後）の一覧。ドラッグの添字はこの配列基準。
  const visibleItems = useMemo(
    () => todoItems.filter((item) => showCompleted || item.completedAt === null),
    [todoItems, showCompleted]
  );

  // ドラッグ中の見た目だけの並び替え。実データはドロップ時まで確定しない。
  const displayItems = useMemo(() => {
    if (
      dragSrcIndex === null ||
      dragDestIndex === null ||
      dragSrcIndex === dragDestIndex
    ) {
      return visibleItems;
    }
    return reorderList(visibleItems, dragSrcIndex, dragDestIndex);
  }, [visibleItems, dragSrcIndex, dragDestIndex]);

  // ドラッグ関連のstateを一括で初期状態に戻す（確定・キャンセルどちらの後始末にも使う）。
  const resetDragState = () => {
    setDragSrcIndex(null);
    setDragDestIndex(null);
    setGrabbedIndex(null);
  };

  // 画面端からこの距離(px)以内にポインタが入ったらオートスクロールする。
  const AUTO_SCROLL_EDGE = 80;
  // オートスクロール1回（dragoverイベント1回分）あたりのスクロール量(px)。
  const AUTO_SCROLL_SPEED = 20;
  // dragoverはポインタ静止中も継続発火するため、この呼び出しだけで連続スクロールになる。
  const autoScrollIfNearEdge = (clientY: number) => {
    if (clientY < AUTO_SCROLL_EDGE) {
      window.scrollBy(0, -AUTO_SCROLL_SPEED);
    } else if (clientY > window.innerHeight - AUTO_SCROLL_EDGE) {
      window.scrollBy(0, AUTO_SCROLL_SPEED);
    }
  };

  // ドラッグ開始位置を記録する。この時点ではtodoItemsは一切変更しない。
  const handleDragStart = (_event: React.DragEvent, index: number) => {
    setDragSrcIndex(index);
  };
  // ホバー位置を更新するだけ（見た目はdisplayItemsのプレビューに反映）。preventDefaultはドロップ発火に必須。
  const handleDragOver = (event: React.DragEvent, targetIndex: number) => {
    event.preventDefault();
    autoScrollIfNearEdge(event.clientY);

    if (dragSrcIndex === null || dragSrcIndex === targetIndex) {
      return;
    }

    setDragDestIndex(targetIndex);
  };
  // 並び順を確定する唯一の箇所。完了/未完了それぞれのグループ単位でバックエンドへ反映する。
  const handleDrop = async (event: React.DragEvent, targetIndex: number) => {
    event.preventDefault();

    if (dragSrcIndex === null || dragSrcIndex === targetIndex) {
      resetDragState();
      return;
    }

    const reordered = reorderList(visibleItems, dragSrcIndex, targetIndex);
    resetDragState();

    const activeIds = reordered
      .filter((item) => item.completedAt === null)
      .map((item) => item.id);
    const doneIds = reordered
      .filter((item) => item.completedAt !== null)
      .map((item) => item.id);

    try {
      if (activeIds.length > 0) {
        await reorderTodos(false, activeIds);
      }
      if (doneIds.length > 0) {
        await reorderTodos(true, doneIds);
      }
      await loadTodos();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    }
  };
  const handleDragEnd = (_event: React.DragEvent, _index: number) => {
    // onDropが発火しなかった場合（画面外へのドロップ等）はtodoItemsが未変更のため元の順序に戻る。
    resetDragState();
  };

  // =====================================================================================
  // ボタンイベント
  // =====================================================================================
  const [dialog, setDialog] = useState<DialogState>(null);
  // 編集対象は都度idからtodoItemsを検索する（並べ替え後もインデックスに依存しないため）。
  const dialogInitial =
    dialog?.mode === "edit"
      ? todoItems.find((item) => item.id === dialog.id) ?? null
      : null;

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm("このTodoを削除しますか？")) {
      return;
    }
    try {
      await deleteTodo(id);
      setDialog(null);
      await loadTodos();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    }
  };
  const handleDoneClick = async (id: string) => {
    const target = todoItems.find((item) => item.id === id);
    if (!target) {
      return;
    }
    try {
      await updateTodo(id, {
        todo: target.todo,
        importance: target.importance,
        limitDate: target.limitDate,
        isDone: target.completedAt === null,
      });
      await loadTodos();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    }
  };
  const handleEditClick = (id: string) => {
    setDialog({ mode: "edit", id });
  };
  const handleAddClick = () => {
    setDialog({ mode: "add" });
  };
  const handleDialogCancel = () => {
    setDialog(null);
  };
  const handleDialogSubmit = async (input: TodoFormInput) => {
    try {
      if (dialog?.mode === "edit") {
        await updateTodo(dialog.id, toBackendInput(input));
      } else {
        await addTodo(toBackendInput(input));
      }
      setDialog(null);
      await loadTodos();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    }
  };

  // =====================================================================================
  // メインコンテンツ
  // =====================================================================================
  const getMainContents = (): React.JSX.Element => {
    return (
      <main className="container">
        {errorMessage && (
          <p className="bg-rose-100 text-rose-700 text-sm p-2 text-left">
            {errorMessage}
          </p>
        )}
        <ul id="todo-list">
          {displayItems.map((todo, index) => (

            <li
              key={todo.id}
              className="flex items-center gap-3 w-full p-2 px-3 bg-white border-b border-gray-200"
              draggable={
                grabbedIndex === index //
              }
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={(e) => handleDragEnd(e, index)}
            >
              <div
                className="shrink-0 cursor-grab text-gray-400 font-bold select-none"
                onMouseDown={() => setGrabbedIndex(index)}
                onMouseUp={() => setGrabbedIndex(null)}
              >
                ::
              </div>
              <div className="text-left flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
                {todo.todo}
              </div>
              <div className="shrink-0 flex gap-2">
                <EmojiButton
                  onClick={() => handleDoneClick(todo.id)}
                  buttonText="✅"
                />
                <EmojiButton
                  onClick={() => handleEditClick(todo.id)}
                  buttonText="✏️"
                />
                <EmojiButton
                  onClick={() => handleDeleteClick(todo.id)}
                  buttonText="❌"
                />
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleAddClick}
          className="add-todo"
        >
          +
        </button>
        {dialog && (
          <TodoFormDialog
            initial={dialogInitial}
            onCancel={handleDialogCancel}
            onSubmit={handleDialogSubmit}
            onDelete={
              dialog.mode === "edit"
                ? () => handleDeleteClick(dialog.id)
                : undefined
            }
          />
        )}
      </main>
    );
  };

  return <>{getMainContents()}</>;
}

export default App;
