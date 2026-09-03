use serde::Serialize;

pub const TODOS_CHANGED_EVENT: &str = "todos://changed";

#[derive(Debug, Clone, Serialize)]
pub struct TodosChangedEvent {
    pub operation: String,
    #[serde(rename = "todoIds")]
    pub todo_ids: Vec<String>,
}
