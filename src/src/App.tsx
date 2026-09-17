import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="container">
      <ul>
        <li className="flex items-center gap-3 w-full p-2 px-3 bg-white border-b border-gray-200">
          <div className="shrink-0 cursor-grab text-gray-400 font-bold select-none">
            ::
          </div>
          <div className="flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
          あーでもない、こーでもない。いろいろなTodo
          </div>
          <div className="shrink-0 flex gap-2">
            <button type="button" className="px-1 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">💮</button>
          <button type="button" className="px-1 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer">🚮</button>
          <button type="button" className="px-1 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer">✐</button>
          </div>
        </li>
        <li className="flex items-center gap-3 w-full p-2 px-3 bg-white border-b border-gray-200">
          <div className="shrink-0 cursor-grab text-gray-400 font-bold select-none">
            ::
          </div>
          <div className="flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
          あーでもない、こーでもない。いろいろなTodo
          </div>
          <div className="shrink-0 flex gap-2">
            <button type="button" className="px-1 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">💮</button>
          <button type="button" className="px-1 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer">🚮</button>
          <button type="button" className="px-1 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer">✐</button>
          </div>
        </li>
        <li className="flex items-center gap-3 w-full p-2 px-3 bg-white border-b border-gray-200">
          <div className="shrink-0 cursor-grab text-gray-400 font-bold select-none">
            ::
          </div>
          <div className="text-left flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
          あーでもない、こーでもない。いろいろなTodo
          </div>
          <div className="shrink-0 flex gap-2">
            <button type="button" className="px-1 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">💮</button>
          <button type="button" className="px-1 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer">🚮</button>
          <button type="button" className="px-1 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer">✐</button>
          </div>
        </li>
        <li className="flex items-center gap-3 w-full p-2 px-3 bg-white border-b border-gray-200">
          <div className="shrink-0 cursor-grab text-gray-400 font-bold select-none">
            ::
          </div>
          <div className="flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
          あーでもない、こーでもない。いろいろなTodo
          </div>
          <div className="shrink-0 flex gap-2">
            <button type="button" className="px-1 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">💮</button>
          <button type="button" className="px-1 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer">🚮</button>
          <button type="button" className="px-1 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer">✐</button>
          </div>
        </li>
        <li className="flex items-center gap-3 w-full p-2 px-3 bg-white border-b border-gray-200">
          <div className="shrink-0 cursor-grab text-gray-400 font-bold select-none">
            ::
          </div>
          <div className="flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
          あーでもない、こーでもない。いろいろなTodo
          </div>
          <div className="shrink-0 flex gap-2">
            <button type="button" className="px-1 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">💮</button>
          <button type="button" className="px-1 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer">🚮</button>
          <button type="button" className="px-1 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer">✐</button>
          </div>
        </li>
        <li className="flex items-center gap-3 w-full p-2 px-3 bg-white border-b border-gray-200">
          <div className="shrink-0 cursor-grab text-gray-400 font-bold select-none">
            ::
          </div>
          <div className="flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
          あーでもない、こーでもない。いろいろなTodo
          </div>
          <div className="shrink-0 flex gap-2">
            <button type="button" className="px-1 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">💮</button>
          <button type="button" className="px-1 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer">🚮</button>
          <button type="button" className="px-1 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer">✐</button>
          </div>
        </li>
        <li className="flex items-center gap-3 w-full p-2 px-3 bg-white border-b border-gray-200">
          <div className="shrink-0 cursor-grab text-gray-400 font-bold select-none">
            ::
          </div>
          <div className="flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
          あーでもない、こーでもない。いろいろなTodo
          </div>
          <div className="shrink-0 flex gap-2">
            <button type="button" className="px-1 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">💮</button>
          <button type="button" className="px-1 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer">🚮</button>
          <button type="button" className="px-1 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer">✐</button>
          </div>
        </li>
        <li className="flex items-center gap-3 w-full p-2 px-3 bg-white border-b border-gray-200">
          <div className="shrink-0 cursor-grab text-gray-400 font-bold select-none">
            ::
          </div>
          <div className="flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
          あーでもない、こーでもない。いろいろなTodo
          </div>
          <div className="shrink-0 flex gap-2">
            <button type="button" className="px-1 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">💮</button>
          <button type="button" className="px-1 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer">🚮</button>
          <button type="button" className="px-1 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer">✐</button>
          </div>
        </li>
        <li className="flex items-center gap-3 w-full p-2 px-3 bg-white border-b border-gray-200">
          <div className="shrink-0 cursor-grab text-gray-400 font-bold select-none">
            ::
          </div>
          <div className="flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
          あーでもない、こーでもない。いろいろなTodo
          </div>
          <div className="shrink-0 flex gap-2">
            <button type="button" className="px-1 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">💮</button>
          <button type="button" className="px-1 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer">🚮</button>
          <button type="button" className="px-1 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer">✐</button>
          </div>
        </li>
        <li className="flex items-center gap-3 w-full p-2 px-3 bg-white border-b border-gray-200">
          <div className="shrink-0 cursor-grab text-gray-400 font-bold select-none">
            ::
          </div>
          <div className="flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
          あーでもない、こーでもない。いろいろなTodo
          </div>
          <div className="shrink-0 flex gap-2">
            <button type="button" className="px-1 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">💮</button>
          <button type="button" className="px-1 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer">🚮</button>
          <button type="button" className="px-1 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer">✐</button>
          </div>
        </li>
      </ul>
    </main>
  );
}

export default App;
