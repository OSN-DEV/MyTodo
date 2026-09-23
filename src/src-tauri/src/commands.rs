use chrono::Utc;
use serde::Serialize;
use tauri::{AppHandle, Emitter, State};
use uuid::Uuid;

use crate::error::{IpcError, IpcResponse};
use crate::events::{TodosChangedEvent, TODOS_CHANGED_EVENT};
use crate::models::{Importance, Todo};
use crate::store::Store;

const MAX_TODO_LENGTH: usize = 10_000;

#[derive(Debug, Serialize)]
pub struct DeletedId {
    pub id: String,
}

fn validate_todo_text(text: &str) -> Result<(), IpcError> {
    if text.trim().is_empty() {
        return Err(IpcError::new(
            "VALIDATION_ERROR",
            "Todoの内容を入力してください。",
        ));
    }
    if text.chars().count() > MAX_TODO_LENGTH {
        return Err(IpcError::new(
            "VALIDATION_ERROR",
            format!("Todoの内容は{MAX_TODO_LENGTH}文字以内で入力してください。"),
        ));
    }
    Ok(())
}

fn next_order(todos: &[Todo], is_done: bool) -> u32 {
    todos
        .iter()
        .filter(|t| t.is_done == is_done)
        .map(|t| t.order + 1)
        .max()
        .unwrap_or(0)
}

fn emit_changed(app: &AppHandle, operation: &str, todo_ids: Vec<String>) {
    let _ = app.emit(
        TODOS_CHANGED_EVENT,
        TodosChangedEvent {
            operation: operation.to_string(),
            todo_ids,
        },
    );
}

fn write_failed() -> IpcError {
    IpcError::new("DATA_WRITE_FAILED", "保存に失敗しました。")
}

#[tauri::command]
pub fn todos_list(is_done: bool, store: State<Store>) -> IpcResponse<Vec<Todo>> {
    let mut todos = store.with_data(|data| {
        data.todos
            .iter()
            .filter(|t| t.is_done == is_done)
            .cloned()
            .collect::<Vec<_>>()
    });
    todos.sort_by_key(|t| t.order);
    IpcResponse::ok(todos)
}

#[tauri::command]
pub fn todos_add(
    todo: String,
    is_done: bool,
    limit_date: Option<String>,
    importance: Importance,
    app: AppHandle,
    store: State<Store>,
) -> IpcResponse<Todo> {
    if let Err(e) = validate_todo_text(&todo) {
        return IpcResponse::err(e);
    }

    let result = store.update(|data| {
        let now = Utc::now().to_rfc3339();
        let order = next_order(&data.todos, is_done);
        let new_todo = Todo {
            id: Uuid::new_v4().to_string(),
            is_done,
            todo,
            limit_date,
            importance,
            completed_at: if is_done { Some(now.clone()) } else { None },
            created_at: now.clone(),
            updated_at: now,
            order,
        };
        data.todos.push(new_todo.clone());
        new_todo
    });

    match result {
        Ok(new_todo) => {
            emit_changed(&app, "added", vec![new_todo.id.clone()]);
            IpcResponse::ok(new_todo)
        }
        Err(_) => IpcResponse::err(write_failed()),
    }
}

#[tauri::command]
pub fn todos_update(
    id: String,
    todo: String,
    is_done: bool,
    limit_date: Option<String>,
    importance: Importance,
    app: AppHandle,
    store: State<Store>,
) -> IpcResponse<Todo> {
    if let Err(e) = validate_todo_text(&todo) {
        return IpcResponse::err(e);
    }

    let result = store.update(|data| {
        let was_done = data.todos.iter().find(|t| t.id == id)?.is_done;
        let moved_order = if is_done != was_done {
            Some(next_order(&data.todos, is_done))
        } else {
            None
        };

        let existing = data.todos.iter_mut().find(|t| t.id == id)?;
        let now = Utc::now().to_rfc3339();

        existing.todo = todo;
        existing.limit_date = limit_date;
        existing.importance = importance;
        existing.updated_at = now.clone();

        if let Some(order) = moved_order {
            existing.is_done = is_done;
            existing.completed_at = if is_done { Some(now) } else { None };
            existing.order = order;
        }

        Some(existing.clone())
    });

    match result {
        Ok(Some(updated)) => {
            emit_changed(&app, "updated", vec![updated.id.clone()]);
            IpcResponse::ok(updated)
        }
        Ok(None) => IpcResponse::err(IpcError::new(
            "NOT_FOUND",
            "対象のタスクが見つかりません。",
        )),
        Err(_) => IpcResponse::err(write_failed()),
    }
}

#[tauri::command]
pub fn todos_delete(id: String, app: AppHandle, store: State<Store>) -> IpcResponse<DeletedId> {
    let result = store.update(|data| {
        let before = data.todos.len();
        data.todos.retain(|t| t.id != id);
        before != data.todos.len()
    });

    match result {
        Ok(true) => {
            emit_changed(&app, "deleted", vec![id.clone()]);
            IpcResponse::ok(DeletedId { id })
        }
        Ok(false) => IpcResponse::err(IpcError::new(
            "NOT_FOUND",
            "対象のタスクが見つかりません。",
        )),
        Err(_) => IpcResponse::err(write_failed()),
    }
}

#[tauri::command]
pub fn todos_reorder(
    is_done: bool,
    ids: Vec<String>,
    app: AppHandle,
    store: State<Store>,
) -> IpcResponse<Vec<Todo>> {
    let result = store.update(|data| {
        let tab_ids: std::collections::HashSet<&str> = data
            .todos
            .iter()
            .filter(|t| t.is_done == is_done)
            .map(|t| t.id.as_str())
            .collect();
        let requested_ids: std::collections::HashSet<&str> =
            ids.iter().map(|id| id.as_str()).collect();

        if requested_ids.len() != ids.len() || requested_ids != tab_ids {
            return None;
        }

        for (index, id) in ids.iter().enumerate() {
            if let Some(t) = data.todos.iter_mut().find(|t| &t.id == id) {
                t.order = index as u32;
            }
        }

        let mut todos: Vec<Todo> = data
            .todos
            .iter()
            .filter(|t| t.is_done == is_done)
            .cloned()
            .collect();
        todos.sort_by_key(|t| t.order);
        Some(todos)
    });

    match result {
        Ok(Some(todos)) => {
            emit_changed(
                &app,
                "reordered",
                todos.iter().map(|t| t.id.clone()).collect(),
            );
            IpcResponse::ok(todos)
        }
        Ok(None) => IpcResponse::err(IpcError::new(
            "VALIDATION_ERROR",
            "並べ替えの対象が不正です。",
        )),
        Err(_) => IpcResponse::err(write_failed()),
    }
}
