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
    <div className="px-4 sm:px-[18px] py-3 bg-[#f1f1f1] dark:bg-[#292929] rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
      <div className="text-xs text-gray-600 dark:text-gray-400 text-center sm:text-left">
        Showing {(currentPage - 1) * limit + 1} to{" "}
        {Math.min(currentPage * limit, total)} of {total} entries
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 text-lg rounded border border-gray-300 dark:border-[#4E4E4E] bg-white dark:bg-[#2F2F2F] text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#3A3A3A] transition-colors"
          title="First page"
          aria-label="First page"
        >
          <MdFirstPage />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 text-lg rounded border border-gray-300 dark:border-[#4E4E4E] bg-white dark:bg-[#2F2F2F] text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#3A3A3A] transition-colors"
          title="Previous page"
          aria-label="Previous page"
        >
          <MdChevronLeft />
        </button>

        <span className="px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 text-lg rounded border border-gray-300 dark:border-[#4E4E4E] bg-white dark:bg-[#2F2F2F] text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#3A3A3A] transition-colors"
          title="Next page"
          aria-label="Next page"
        >
          <MdChevronRight />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="p-1.5 text-lg rounded border border-gray-300 dark:border-[#4E4E4E] bg-white dark:bg-[#2F2F2F] text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#3A3A3A] transition-colors"
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
