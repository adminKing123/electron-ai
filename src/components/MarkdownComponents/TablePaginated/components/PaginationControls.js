import React from "react";
import {
  MdFirstPage,
  MdLastPage,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

/**
 * Pagination controls component with responsive design
 */
const PaginationControls = ({
  currentPage,
  totalPages,
  limit,
  total,
  onPageChange,
}) => {
  return (
    <div className="px-4 py-2.5 bg-ink-75 dark:bg-void-825 border-t border-ink-100 dark:border-void-800 flex flex-col sm:flex-row justify-between items-center gap-3">
      <div className="text-[11px] text-ink-500 dark:text-ink-550 text-center sm:text-left">
        Showing {(currentPage - 1) * limit + 1} to{" "}
        {Math.min(currentPage * limit, total)} of {total} entries
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-7 h-7 flex items-center justify-center text-[16px] rounded-lg border border-ink-150 dark:border-void-800 bg-white dark:bg-void-825 text-ink-500 dark:text-ink-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink-75 dark:hover:bg-void-800 hover:text-ink-975 dark:hover:text-white transition-colors"
          title="First page"
          aria-label="First page"
        >
          <MdFirstPage />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-7 h-7 flex items-center justify-center text-[16px] rounded-lg border border-ink-150 dark:border-void-800 bg-white dark:bg-void-825 text-ink-500 dark:text-ink-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink-75 dark:hover:bg-void-800 hover:text-ink-975 dark:hover:text-white transition-colors"
          title="Previous page"
          aria-label="Previous page"
        >
          <MdChevronLeft />
        </button>

        <span className="px-1.5 py-1 text-[11px] text-ink-600 dark:text-ink-500">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-7 h-7 flex items-center justify-center text-[16px] rounded-lg border border-ink-150 dark:border-void-800 bg-white dark:bg-void-825 text-ink-500 dark:text-ink-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink-75 dark:hover:bg-void-800 hover:text-ink-975 dark:hover:text-white transition-colors"
          title="Next page"
          aria-label="Next page"
        >
          <MdChevronRight />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="w-7 h-7 flex items-center justify-center text-[16px] rounded-lg border border-ink-150 dark:border-void-800 bg-white dark:bg-void-825 text-ink-500 dark:text-ink-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink-75 dark:hover:bg-void-800 hover:text-ink-975 dark:hover:text-white transition-colors"
          title="Last page"
          aria-label="Last page"
        >
          <MdLastPage />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
