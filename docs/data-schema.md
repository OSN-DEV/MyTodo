# データスキーマ

`MyTodo.data` はUTF-8のJSONオブジェクトとする。

```json
{
  "version": 1,
  "settings": {
    "hotkey": "CmdOrCtrl+Alt+Shift+Q"
  },
  "todos": []
}
```

## ルート項目

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `version` | number | はい | データ形式のバージョン。初期値は `1`。 |
| `settings` | object | はい | アプリ設定。 |
| `settings.hotkey` | string | はい | Tauriが解釈できるグローバルショートカット。 |
| `todos` | array | はい | タスク配列。 |

## タスク項目

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | はい | UUID v4。 |
| `is_done` | boolean | はい | 完了状態。 |
| `todo` | string | はい | 1から10,000文字のタスク本文。 |
| `limit_date` | string / null | はい | `YYYY-MM-DD`形式の期限。未設定は`null`。 |
| `importance` | string | はい | `low`、`medium`、`high`のいずれか。 |
| `completed_at` | string / null | はい | UTCのISO 8601形式の完了日時。未完了は`null`。 |
| `created_at` | string | はい | UTCのISO 8601形式の作成日時。 |
| `updated_at` | string | はい | UTCのISO 8601形式の最終更新日時。 |
| `order` | number | はい | タブ内の表示順を表す0以上の整数。 |

## 整合性ルール

- `is_done` が `false` の場合、`completed_at` は `null` とする。
- `is_done` が `true` の場合、`completed_at` は `null` にしない。
- 同じ完了状態のタスク群では、`order` は重複しない連続した整数とする。
- 日時はUTCで保存し、UIでは実行環境のローカル時刻で表示する。
- 未知のルート項目およびタスク項目は、読み込み時に保持する。