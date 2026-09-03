# IPC契約

フロントエンドはTauriの`invoke`でコマンドを呼び出す。コマンド名にはTauriで利用するスネークケース名を使用する。

## 共通レスポンス

すべてのコマンドは以下の形式で返す。

```ts
type IpcResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string } };
```

エラー時、`message` は画面にそのまま表示できる日本語メッセージとする。技術的な詳細はバックエンドでログに出力する。

## Todoコマンド

| Tauriコマンド | 要求 | 成功時の`data` | エラー例 |
| --- | --- | --- | --- |
| `todos_list` | `{ isDone: boolean }` | `Todo[]` | `DATA_READ_FAILED` |
| `todos_add` | `{ todo, isDone, limitDate, importance }` | `Todo` | `VALIDATION_ERROR`, `DATA_WRITE_FAILED` |
| `todos_update` | `{ id, todo, isDone, limitDate, importance }` | `Todo` | `NOT_FOUND`, `VALIDATION_ERROR`, `DATA_WRITE_FAILED` |
| `todos_delete` | `{ id }` | `{ id }` | `NOT_FOUND`, `DATA_WRITE_FAILED` |
| `todos_reorder` | `{ isDone, ids }` | `Todo[]` | `VALIDATION_ERROR`, `DATA_WRITE_FAILED` |

`Todo` の項目は [data-schema.md](data-schema.md) のタスク項目に従う。

`todos_reorder` の `ids` は対象タブに存在する全タスクのIDを表示順に並べた配列とする。重複、不足、別タブのIDを含む要求は`VALIDATION_ERROR`とする。

## 設定・状態コマンド

| Tauriコマンド | 要求 | 成功時の`data` | エラー例 |
| --- | --- | --- | --- |
| `log_get_config` | なし | `{ maxBytes: 1048576, maxFiles: 5 }` | `DATA_READ_FAILED` |
| `backup_get_status` | なし | `{ latestBackupAt: string \| null, count: number }` | `DATA_READ_FAILED` |

ホットキー設定の取得と更新は、実装時に`settings_get`および`settings_update`として追加する。更新時は新しいホットキーの登録に成功してから保存する。

## 更新イベント

バックエンドはデータ保存後に`todos://changed`イベントを発火する。イベントペイロードは以下とする。

```ts
type TodosChangedEvent = {
  operation: "added" | "updated" | "deleted" | "reordered" | "expired_deleted";
  todoIds: string[];
};
```

フロントエンドはイベント受信時、表示中のタブの一覧を再取得する。イベントを受信できない場合でも、各更新コマンドの成功レスポンスを用いて画面状態を更新する。