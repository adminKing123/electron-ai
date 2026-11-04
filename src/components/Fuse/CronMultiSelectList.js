import React, { useMemo } from "react";

const LIST_CLASS =
  "w-full min-h-[11rem] max-h-52 rounded-md border border-ink-200 dark:border-void-775 " +
  "bg-white dark:bg-void-850 text-[12px] text-ink-800 dark:text-ink-200 " +
  "font-normal leading-snug px-0 py-0 overflow-y-auto " +
  "focus:outline-none focus:ring-2 focus:ring-brand-500/25 " +
  "[&_option]:px-2 [&_option]:py-0.5 [&_option:checked]:bg-brand-500 [&_option:checked]:text-white " +
  "dark:[&_option:checked]:bg-brand-600";

/**
 * Multi-select list (cron-job.org style). Empty selection = "any" (*) in cron.
 */
export function CronMultiSelectList({ label, options, value, onChange, size = 14, ariaLabel }) {
  const selectedSet = useMemo(
    () => new Set((value || []).map((v) => String(v))),
    [value],
  );

  const selectedValues = useMemo(
    () => options.filter((o) => selectedSet.has(String(o.value))).map((o) => String(o.value)),
    [options, selectedSet],
  );

  return (
    <div className="flex flex-col min-w-0 flex-1">
      <p className="text-[11px] font-semibold text-ink-600 dark:text-ink-400 mb-1.5 truncate">
        {label}
      </p>
      <select
        multiple
        size={size}
        aria-label={ariaLabel || label}
        className={LIST_CLASS}
        value={selectedValues}
        onChange={(e) => {
          const next = [...e.target.selectedOptions].map((o) => {
            const n = Number(o.value);
            return Number.isNaN(n) ? o.value : n;
          });
          onChange(next.sort((a, b) => (a > b ? 1 : -1)));
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CronMultiSelectPanel({ title, hint, onClearAny, children }) {
  return (
    <div className="rounded-xl border border-ink-200 dark:border-void-775 bg-ink-50/50 dark:bg-void-875/30 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-ink-800 dark:text-ink-200">{title}</p>
          {hint ? (
            <p className="text-[10px] text-ink-500 dark:text-ink-550 mt-0.5 truncate" title={hint}>
              {hint}
            </p>
          ) : null}
        </div>
        {onClearAny ? (
          <button
            type="button"
            onClick={onClearAny}
            className="shrink-0 text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            Any (*)
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
