use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use chrono::{DateTime, Duration, Utc};

use crate::models::DataFile;

const DATA_FILE_NAME: &str = "MyTodo.data";
const MAX_BACKUPS: u32 = 3;
const EXPIRE_AFTER_HOURS: i64 = 72;

pub struct Store {
    inner: Mutex<DataFile>,
    path: PathBuf,
}

impl Store {
    /// `dir` に置かれた `MyTodo.data` を読み込む。既存ファイルがあれば読み込み前に世代バックアップを作成する。
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(DATA_FILE_NAME);
        let data = if path.exists() {
            create_backup(&path);
            fs::read_to_string(&path)
                .ok()
                .and_then(|content| serde_json::from_str(&content).ok())
                .unwrap_or_default()
        } else {
            DataFile::default()
        };

        Self {
            inner: Mutex::new(data),
            path,
        }
    }

    pub fn with_data<R>(&self, f: impl FnOnce(&DataFile) -> R) -> R {
        let guard = self.inner.lock().expect("store mutex poisoned");
        f(&guard)
    }

    /// クロージャでデータを変更し、変更後の内容をファイルへ保存する。
    pub fn update<R>(&self, f: impl FnOnce(&mut DataFile) -> R) -> std::io::Result<R> {
        let mut guard = self.inner.lock().expect("store mutex poisoned");
        let result = f(&mut guard);
        persist(&self.path, &guard)?;
        Ok(result)
    }

    /// 完了から72時間を超えた完了タスクを削除する。削除したタスクのIDを返す。
    pub fn expire_completed(&self) -> std::io::Result<Vec<String>> {
        self.update(|data| {
            let cutoff = Utc::now() - Duration::hours(EXPIRE_AFTER_HOURS);
            let mut expired = Vec::new();
            data.todos.retain(|todo| {
                let keep = !(todo.is_done
                    && todo
                        .completed_at
                        .as_deref()
                        .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
                        .map(|completed| completed.with_timezone(&Utc) < cutoff)
                        .unwrap_or(false));
                if !keep {
                    expired.push(todo.id.clone());
                }
                keep
            });
            expired
        })
    }

    pub fn backup_status(&self) -> (Option<String>, u32) {
        backup_status(&self.path)
    }
}

fn persist(path: &Path, data: &DataFile) -> std::io::Result<()> {
    let json = serde_json::to_string_pretty(data)?;
    fs::write(path, json)
}

fn backup_path(path: &Path, generation: u32) -> Option<PathBuf> {
    let dir = path.parent()?;
    let file_name = path.file_name()?.to_str()?;
    Some(dir.join(format!("{file_name}.bak.{generation}")))
}

/// 世代ローテーション（`.bak.1` が最新）を行い、現在のファイルを `.bak.1` として複製する。
fn create_backup(path: &Path) {
    for generation in (1..MAX_BACKUPS).rev() {
        let (Some(from), Some(to)) = (
            backup_path(path, generation),
            backup_path(path, generation + 1),
        ) else {
            continue;
        };
        if from.exists() {
            let _ = fs::rename(from, to);
        }
    }
    if let Some(newest) = backup_path(path, 1) {
        let _ = fs::copy(path, newest);
    }
}

fn backup_status(path: &Path) -> (Option<String>, u32) {
    let mut count = 0;
    let mut latest: Option<DateTime<Utc>> = None;

    for generation in 1..=MAX_BACKUPS {
        let Some(backup) = backup_path(path, generation) else {
            continue;
        };
        let Ok(metadata) = fs::metadata(&backup) else {
            continue;
        };
        count += 1;
        if let Ok(modified) = metadata.modified() {
            let modified: DateTime<Utc> = modified.into();
            if latest.map_or(true, |current| modified > current) {
                latest = Some(modified);
            }
        }
    }

    (latest.map(|d| d.to_rfc3339()), count)
}
