// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::menu::{CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder, SubmenuBuilder};
#[cfg(debug_assertions)]
use tauri::Manager;
use tauri::{Emitter, Runtime};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// フロントエンドが購読するイベント名。View > Complete Todo クリックのたびに発火する。
const TOGGLE_COMPLETE_TODO_EVENT: &str = "menu://toggle-complete-todo";

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
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let menu = build_menu(app.handle())?;
            app.set_menu(menu)?;
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
