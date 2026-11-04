import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_SCHEDULE_TIMEZONE,
  SCHEDULE_TIMEZONE_OPTIONS,
  filterTimezoneOptions,
} from "./scheduleTimezoneOptions";

const LIST_MAX = 280;

/**
 * Searchable IANA timezone picker (cron-job.org compatible). Default: UTC.
 */
const TimezoneSelectField = ({ value, onChange }) => {
  const resolved = value || DEFAULT_SCHEDULE_TIMEZONE;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    if (!value) onChange(DEFAULT_SCHEDULE_TIMEZONE);
  }, [value, onChange]);

  const selected = useMemo(
    () =>
      SCHEDULE_TIMEZONE_OPTIONS.find((o) => o.value === resolved) ?? {
        value: resolved,
        label: resolved.replace(/_/g, " "),
        offset: "",
      },
    [resolved],
  );

  const filtered = useMemo(
    () => filterTimezoneOptions(SCHEDULE_TIMEZONE_OPTIONS, query),
    [query],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pick = (tz) => {
    onChange(tz);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id="timezone-label"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-3 py-2 rounded-lg text-[13px]
          bg-white dark:bg-void-850 border border-ink-200 dark:border-void-775
          text-ink-800 dark:text-ink-200 hover:border-ink-300 dark:hover:border-void-700
          focus:outline-none focus:ring-2 focus:ring-brand-500/30 flex items-center justify-between gap-2"
      >
        <span className="min-w-0 truncate">
          {selected.offset ? (
            <>
              <span className="text-ink-500 dark:text-ink-550 tabular-nums">{selected.offset}</span>
              {" · "}
            </>
          ) : null}
          <span className="font-medium">{selected.label}</span>
        </span>
        <span className="text-ink-400 shrink-0" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-lg border border-ink-200 dark:border-void-775
            bg-white dark:bg-void-850 shadow-lg overflow-hidden"
          role="listbox"
          aria-labelledby="timezone-label"
        >
          <div className="p-2 border-b border-ink-100 dark:border-void-800">
            <input
              type="search"
              autoFocus
              placeholder="Search time zones…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[12px] rounded-md
                bg-ink-50 dark:bg-void-875 border border-ink-150 dark:border-void-800
                text-ink-875 dark:text-ink-200 outline-none focus:ring-1 focus:ring-brand-500/40"
            />
          </div>
          <ul
            className="overflow-y-auto py-1 m-0 list-none"
            style={{ maxHeight: LIST_MAX }}
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[12px] text-ink-500">No matches</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={opt.value === resolved}
                    onClick={() => pick(opt.value)}
                    className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors ${
                      opt.value === resolved
                        ? "bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300"
                        : "text-ink-800 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-void-825"
                    }`}
                  >
                    <span className="text-ink-500 dark:text-ink-550 tabular-nums mr-2">
                      {opt.offset}
                    </span>
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TimezoneSelectField;
