import React from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";

/** Shared list-table chrome (send-logs style reference). */

export const FUSE_LIST_TABLE_WRAP =
  "overflow-x-auto rounded-lg border border-[#e3e5e8] dark:border-[#2a2a2a] bg-white dark:bg-[#171717] shadow-sm";

export const FUSE_LIST_TH =
  "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#666] whitespace-nowrap";

export const FUSE_LIST_TD =
  "px-4 py-2.5 text-[13px] text-[#374151] dark:text-[#ccc] align-middle";

export const FUSE_LIST_ROW =
  "border-b border-[#eef0f2] dark:border-[#252525] last:border-b-0 hover:bg-[#fafbfc] dark:hover:bg-[#1c1c1c] transition-colors";

export const FUSE_LIST_LINK =
  "text-[13px] font-medium text-[#2563eb] dark:text-[#60a5fa] hover:underline bg-transparent border-0 p-0 cursor-pointer";

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

/** Short run id for the `#…` link column. */
export function fmtRunIdLink(runId) {
  if (!runId) return "#—";
  const compact = runId.replace(/-/g, "").slice(0, 6);
  return `#${compact}`;
}

export function FuseListingStatusDot({ status }) {
  const map = {
    success: "bg-emerald-500",
    active: "bg-emerald-500",
    failed: "bg-red-500",
    error: "bg-red-500",
    running: "bg-blue-500 animate-pulse",
    inactive: "bg-[#c4c4c4] dark:bg-[#555]",
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
  "px-4 py-2.5 border-t border-[#eef0f2] dark:border-[#252525] bg-[#fafbfc] dark:bg-[#141414]";

const PAGINATION_BTN =
  "w-8 h-8 flex items-center justify-center rounded-lg text-[#888] dark:text-[#555] hover:bg-[#ebebeb] dark:hover:bg-[#2a2a2a] hover:text-[#111] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

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
          <p className="text-[12px] text-[#6b7280] dark:text-[#888] shrink-0">
            <span className="font-semibold text-[#374151] dark:text-[#bbb]">{count}</span>{" "}
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
      <tr className="border-b border-[#eef0f2] dark:border-[#252525] bg-[#f8f9fb] dark:bg-[#1a1a1a]">
        {children}
      </tr>
    </thead>
  );
}
