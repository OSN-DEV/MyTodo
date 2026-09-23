// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;
mod error;
mod events;
mod models;
mod store;

use tauri::menu::{CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager, Runtime, WindowEvent};

use events::TODOS_CHANGED_EVENT;
use store::Store;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// フロントエンドが購読するイベント名。View > Complete Todo クリックのたびに発火する。
const TOGGLE_COMPLETE_TODO_EVENT: &str = "menu://toggle-complete-todo";

// データファイル（MyTodo.data）の保存先。実行ファイルと同じフォルダに置く。
fn data_dir() -> std::path::PathBuf {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| std::path::PathBuf::from("."))
}

fn build_menu<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<tauri::menu::Menu<R>> {
    let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
    let file_menu = SubmenuBuilder::new(app, "File").item(&quit).build()?;

    // チェック状態はメニュー自身が保持し、クリックのたびにフロントへ通知するだけに留める。
    let complete_todo = CheckMenuItemBuilder::with_id("toggle_complete_todo", "Complete Todo")
        .checked(false)
        .build(app)?;
    let view_menu = SubmenuBuilder::new(app, "View")
        .item(&complete_todo)
        .build()?;

    let dev_window = MenuItemBuilder::with_id("open_devtools", "Dev Window").build(app)?;
    let debug_menu = SubmenuBuilder::new(app, "Debug").item(&dev_window).build()?;

    MenuBuilder::new(app)
        .item(&file_menu)
        .item(&view_menu)
        .item(&debug_menu)
        .build()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::todos_list,
            commands::todos_add,
            commands::todos_update,
            commands::todos_delete,
            commands::todos_reorder,
        ])
        .setup(|app| {
            let menu = build_menu(app.handle())?;
            app.set_menu(menu)?;

            let store = Store::load(&data_dir());
            app.manage(store);

            Ok(())
        })
        .on_menu_event(|app, event| match event.id().0.as_str() {
            "quit" => app.exit(0),
            "toggle_complete_todo" => {
                let _ = app.emit(TOGGLE_COMPLETE_TODO_EVENT, ());
            }
            "open_devtools" => {
                // devtoolsはデバッグビルドのみ対象（リリースビルドではコンパイル対象外にする）。
                #[cfg(debug_assertions)]
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            _ => {}
        })
        .on_window_event(|window, event| {
            // フォーカス復帰時に完了72時間経過タスクを削除し、削除があればフロントへ通知する。
            if let WindowEvent::Focused(true) = event {
                let app = window.app_handle();
                if let Some(store) = app.try_state::<Store>() {
                    if let Ok(expired_ids) = store.expire_completed() {
                        if !expired_ids.is_empty() {
                            let _ = app.emit(
                                TODOS_CHANGED_EVENT,
                                events::TodosChangedEvent {
                                    operation: "expired_deleted".to_string(),
                                    todo_ids: expired_ids,
                                },
                            );
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
