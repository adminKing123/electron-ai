/**
 * Pagination.js
 * ─────────────
 * Simple page-navigation control used across list/table pages.
 *
 * Props
 * -----
 * page        {number}   Current 0-based page index.
 * totalPages  {number}   Total number of pages.
 * onPage      {Function} Called with the new 0-based page index.
 */

import React from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";

const btnBase =
  "inline-flex items-center justify-center h-8 min-w-[32px] px-2 rounded-lg text-[12.5px] font-medium transition-colors select-none";

const Pagination = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null;

  /* Build the visible page numbers — always show first, last, and a window
     of 3 around the current page, with "…" gaps in between. */
  const pages = [];
  const addPage = (p) => {
    if (p >= 0 && p < totalPages) pages.push(p);
  };

  // Build raw set
  const rawSet = new Set();
  rawSet.add(0);
  rawSet.add(totalPages - 1);
  for (let i = page - 1; i <= page + 1; i++) {
    if (i >= 0 && i < totalPages) rawSet.add(i);
  }

  const sorted = [...rawSet].sort((a, b) => a - b);

  // Insert ellipsis markers (-1) where gaps exist
  const withEllipsis = [];
  for (let i = 0; i < sorted.length; i++) {
    withEllipsis.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      withEllipsis.push(-1); // gap marker
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4 pb-2">
      {/* Previous */}
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        title="Previous page"
        className={`${btnBase}
          text-[#888] dark:text-[#555]
          hover:bg-[#ebebeb] dark:hover:bg-[#2a2a2a]
          hover:text-[#111] dark:hover:text-white
          disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <TbChevronLeft className="w-[15px] h-[15px]" />
      </button>

      {/* Page numbers */}
      {withEllipsis.map((p, i) =>
        p === -1 ? (
          <span key={`gap-${i}`} className="px-1 text-[12px] text-[#ccc] dark:text-[#444] select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`${btnBase} ${
              p === page
                ? "bg-[#111] dark:bg-[#ebebeb] text-white dark:text-[#111] cursor-default"
                : "text-[#888] dark:text-[#555] hover:bg-[#ebebeb] dark:hover:bg-[#2a2a2a] hover:text-[#111] dark:hover:text-white"
            }`}
          >
            {p + 1}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages - 1}
        title="Next page"
        className={`${btnBase}
          text-[#888] dark:text-[#555]
          hover:bg-[#ebebeb] dark:hover:bg-[#2a2a2a]
          hover:text-[#111] dark:hover:text-white
          disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <TbChevronRight className="w-[15px] h-[15px]" />
      </button>
    </div>
  );
};

export default Pagination;
