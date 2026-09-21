import { useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
// import "./TodoList.css";
import "./component/TodoList/style.css"
import { getDummyData } from "./component/TodoList/stub";
import { EmojiButton } from "./component/TodoList/EmojiButton";
        
function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");


   const [todoItems, setTodoItems] = useState<TodoItem[]>(getDummyData());

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  // １行分の情報をドラッグするのでdraggableはliタグに対して設定する必要がある。
  // ただしドラック開始はノブをクリックしたときに限定したいので、ノブのクリック時にドラッグを許可する。
  const [grabbedIndex, setGrabbedIndex] = useState<number | null>(null);
  // ドラッグ中の元インデックスとプレビュー先インデックス。todoItems自体はドロップ時まで変更しない。
  const [dragSrcIndex, setDragSrcIndex] = useState<number | null>(null);
  const [dragDestIndex, setDragDestIndex] = useState<number | null>(null);

  // =====================================================================================
  // リスト並べ替え関連
  // =====================================================================================
  // fromの要素をtoの位置へ移動した新しい配列を返す（todoItems自体は変更しない）。
  const reorder = (from: number, to: number) => {
    const updated = [...todoItems];
    const [draggedItem] = updated.splice(from, 1);
    updated.splice(to, 0, draggedItem);
    return updated;
  };

  // ドラッグ中の見た目だけの並び替え。実データはドロップ時まで確定しない。
  const displayItems = useMemo(() => {
    if (
      dragSrcIndex === null ||
      dragDestIndex === null ||
      dragSrcIndex === dragDestIndex
    ) {
      return todoItems;
    }
    return reorder(dragSrcIndex, dragDestIndex);
  }, [todoItems, dragSrcIndex, dragDestIndex]);

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
  const handleDragStart = (event: React.DragEvent, index: number) => {
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
  // 並び順を確定する唯一の箇所。ここでtodoItemsを更新し、orderを振り直す。
  const handleDrop = (event: React.DragEvent, targetIndex: number) => {
    event.preventDefault();

    if (dragSrcIndex === null || dragSrcIndex === targetIndex) {
      resetDragState();
      return;
    }

    const updated = reorder(dragSrcIndex, targetIndex).map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    setTodoItems(updated);
    resetDragState();
  };
  const handleDragEnd = (event: React.DragEvent, index: number) => {
    // onDropが発火しなかった場合（画面外へのドロップ等）はtodoItemsが未変更のため元の順序に戻る。
    resetDragState();
  };



  // =====================================================================================
  // ボタンイベント
  // =====================================================================================
  const handleDeleteClick = (index: number) => {
  }
  const handleDoneClick = (index: number) => {
  }
  const handleEditClick = (index: number) => {
  }


  // =====================================================================================
  // メインコンテンツ
  // =====================================================================================
  const getMainContents = ():React.JSX.Element => {
    return (    <main className="container">
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
                onClick={() => handleDoneClick(index)}
                buttonText="✅"
              />
              <EmojiButton
                onClick={() => handleEditClick(index)}
                buttonText="✏️"
              />
              <EmojiButton
                onClick={() => handleDeleteClick(index)}
                buttonText="❌"
              />
            </div>
          </li>
        ))}
      </ul>
    </main>)
  }

  return (
    <>
      { getMainContents()}
    </>
  );


}

export default App;
