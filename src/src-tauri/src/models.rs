use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Importance {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Todo {
    pub id: String,
    pub is_done: bool,
    pub todo: String,
    pub limit_date: Option<String>,
    pub importance: Importance,
    pub completed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub order: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub hotkey: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            hotkey: "CmdOrCtrl+Alt+Shift+Q".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataFile {
    pub version: u32,
    pub settings: Settings,
    pub todos: Vec<Todo>,
}

impl Default for DataFile {
    fn default() -> Self {
        Self {
            version: 1,
            settings: Settings::default(),
            todos: Vec::new(),
        }
    }
}
