mod commands;
mod error;
mod events;
mod models;
mod store;

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{Emitter, Manager, WindowEvent};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

use events::TODOS_CHANGED_EVENT;
use store::Store;

fn data_dir() -> std::path::PathBuf {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| std::path::PathBuf::from("."))
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        show_main_window(app);
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::todos_list,
            commands::todos_add,
            commands::todos_update,
            commands::todos_delete,
            commands::todos_reorder,
            commands::log_get_config,
            commands::backup_get_status,
        ])
        .setup(|app| {
            let store = Store::load(&data_dir());
            let hotkey = store.with_data(|data| data.settings.hotkey.clone());
            app.manage(store);

            if let Ok(shortcut) = hotkey.parse::<tauri_plugin_global_shortcut::Shortcut>() {
                if let Err(e) = app.global_shortcut().register(shortcut) {
                    // ホットキー登録に失敗しても起動は継続し、トレイから表示可能とする。
                    eprintln!("failed to register global shortcut {hotkey}: {e}");
                }
            }

            let show_item = MenuItem::with_id(app, "show", "表示", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "終了", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&tray_menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_main_window(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
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
