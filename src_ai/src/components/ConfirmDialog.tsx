interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40">
      <div className="w-80 rounded-lg bg-white p-4 shadow-lg">
        <p className="text-sm text-slate-700">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="rounded bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700"
            onClick={onConfirm}
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
