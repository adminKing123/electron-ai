import React from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";

/** Shared list-table chrome (send-logs style reference). */

export const FUSE_LIST_TABLE_WRAP =
  "overflow-x-auto rounded-2xl border border-ink-150 dark:border-void-800 bg-white dark:bg-void-850";

export const FUSE_LIST_TH =
  "px-5 py-3 text-left text-[12px] font-medium text-ink-500 dark:text-ink-500 whitespace-nowrap";

export const FUSE_LIST_TD =
  "px-5 py-3.5 text-[13px] text-ink-725 dark:text-ink-300 align-middle";

export const FUSE_LIST_ROW =
  "border-b border-ink-100 dark:border-void-800 last:border-b-0 hover:bg-ink-25 dark:hover:bg-void-825 transition-colors";

export const FUSE_LIST_LINK =
  "text-[13px] font-medium text-brand-600 dark:text-brand-400 hover:underline bg-transparent border-0 p-0 cursor-pointer";

export function fmtListingTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${mm}-${dd} ${hh}:${min}`;
  } catch {
    return iso;
  }
}

/** Duration like `1.19 s` in the reference UI. */
export function fmtListingDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function compactFuseDocId(id) {
  if (!id) return null;
  return `#${String(id).replace(/-/g, "").slice(0, 6)}`;
}

/** Short run id for the `#...` link column. */
export function fmtRunIdLink(runId) {
  return compactFuseDocId(runId) ?? "#—";
}

/** Short version id for run history (no `#` placeholder when missing). */
export function fmtVersionIdLink(versionId) {
  return compactFuseDocId(versionId) ?? "—";
}

export function FuseListingStatusDot({ status }) {
  const map = {
    success: "bg-emerald-500",
    active: "bg-emerald-500",
    failed: "bg-red-500",
    error: "bg-red-500",
    running: "bg-brand-500 animate-pulse",
    inactive: "bg-ink-300 dark:bg-ink-650",
  };
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${map[status] ?? map.failed}`}
      title={status}
      aria-label={status}
    />
  );
}

export function FuseListingViewLink({ onClick, href, children = "View", disabled = false }) {
  const cls = `${FUSE_LIST_LINK}${disabled ? " opacity-50 cursor-not-allowed pointer-events-none" : ""}`;
  if (href) {
    return (
      <a href={href} className={cls} onClick={onClick} aria-disabled={disabled}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export const FUSE_LIST_TABLE_FOOTER =
  "px-5 py-3 border-t border-ink-100 dark:border-void-800 bg-ink-25/60 dark:bg-void-850";

const PAGINATION_BTN =
  "w-8 h-8 flex items-center justify-center rounded-lg text-ink-500 dark:text-ink-550 hover:bg-ink-100 dark:hover:bg-void-800 hover:text-ink-975 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

export function FuseListingTablePagination({
  page = 0,
  hasNextPage = false,
  onPrev,
  onNext,
}) {
  if (page === 0 && !hasNextPage) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onPrev}
        disabled={page === 0}
        title="Previous page"
        className={PAGINATION_BTN}
      >
        <TbChevronLeft className="w-[16px] h-[16px]" />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNextPage}
        title="Next page"
        className={PAGINATION_BTN}
      >
        <TbChevronRight className="w-[16px] h-[16px]" />
      </button>
    </div>
  );
}

export function FuseListingTableFooter({
  count,
  singular,
  plural,
  page,
  hasNextPage,
  onPrev,
  onNext,
}) {
  const word = count === 1 ? singular : plural ?? `${singular}s`;
  const showCount = count != null && count > 0;
  const showPagination =
    onPrev != null &&
    onNext != null &&
    (page > 0 || hasNextPage);

  if (!showCount && !showPagination) return null;

  return (
    <div className={FUSE_LIST_TABLE_FOOTER}>
      <div className="flex items-center justify-between gap-3 min-h-[32px]">
        <div className="flex items-center">
          {showPagination && (
            <FuseListingTablePagination
              page={page}
              hasNextPage={hasNextPage}
              onPrev={onPrev}
              onNext={onNext}
            />
          )}
        </div>
        {showCount && (
          <p className="text-[12px] text-ink-600 dark:text-ink-500 shrink-0">
            <span className="font-semibold text-ink-725 dark:text-ink-350">{count}</span>{" "}
            {word}
          </p>
        )}
      </div>
    </div>
  );
}

export function FuseListingTableHead({ children }) {
  return (
    <thead>
      <tr className="border-b border-ink-100 dark:border-void-800 bg-ink-25/60 dark:bg-void-850">
        {children}
      </tr>
    </thead>
  );
}
