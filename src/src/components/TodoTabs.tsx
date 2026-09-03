interface TodoTabsProps {
  active: "active" | "done";
  activeCount: number;
  doneCount: number;
  onChange: (tab: "active" | "done") => void;
}

export function TodoTabs({
  active,
  activeCount,
  doneCount,
  onChange,
}: TodoTabsProps) {
  const tabClass = (tab: "active" | "done") =>
    `flex-1 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
      active === tab
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-slate-500 hover:text-slate-700"
    }`;

  return (
    <div className="flex border-b border-slate-200">
      <button
        type="button"
        className={tabClass("active")}
        onClick={() => onChange("active")}
      >
        未完了 ({activeCount})
      </button>
      <button
        type="button"
        className={tabClass("done")}
        onClick={() => onChange("done")}
      >
        完了 ({doneCount})
      </button>
    </div>
  );
}
