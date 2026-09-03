import type { Importance } from "../types/todo";

export const IMPORTANCE_LABEL: Record<Importance, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export const IMPORTANCE_BADGE_CLASS: Record<Importance, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
};

export function ImportanceBadge({ importance }: { importance: Importance }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${IMPORTANCE_BADGE_CLASS[importance]}`}
    >
      {IMPORTANCE_LABEL[importance]}
    </span>
  );
}
