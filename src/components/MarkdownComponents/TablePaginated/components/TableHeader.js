import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { MdSearch, MdClear } from "react-icons/md";

const SearchInput = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [debouncedValue] = useDebounce(inputValue, 500);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange?.(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  const handleClear = useCallback(() => {
    setInputValue("");
  }, []);

  return (
    <div className="relative flex-1 sm:max-w-xs">
      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
        <MdSearch className="h-3.5 w-3.5 text-ink-400 dark:text-ink-550" />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search..."
        className="block w-full pl-7 pr-7 py-1.5 text-[12px]
                   border border-ink-150 dark:border-void-800 rounded-lg
                   bg-white dark:bg-void-825
                   text-ink-750 dark:text-ink-300
                   placeholder:text-ink-450 dark:placeholder:text-ink-600
                   focus:outline-none focus:ring-1 focus:ring-ink-300 dark:focus:ring-void-650
                   transition-colors"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer
                     text-ink-400 hover:text-ink-650 dark:text-ink-550 dark:hover:text-ink-400
                     transition-colors"
          aria-label="Clear search"
        >
          <MdClear className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const RowsPerPageSelector = ({ limit, onChange }) => {
  return (
    <div className="flex justify-end items-center gap-2">
      <span className="text-[11px] text-ink-500 dark:text-ink-550 whitespace-nowrap">
        Rows per page:
      </span>
      <select
        value={limit}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-2 py-1.5 text-[12px]
                   border border-ink-150 dark:border-void-800 rounded-lg
                   bg-white dark:bg-void-825
                   text-ink-750 dark:text-ink-300
                   cursor-pointer focus:outline-none transition-colors"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </div>
  );
};

const TableHeader = ({
  limit,
  onLimitChange,
  search,
  onSearchChange,
  hasSearch,
}) => {
  return (
    <div className="px-4 py-2 bg-ink-25 dark:bg-void-850 border-b border-ink-100 dark:border-void-800">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        {hasSearch && <SearchInput value={search} onChange={onSearchChange} />}

        <RowsPerPageSelector limit={limit} onChange={onLimitChange} />
      </div>
    </div>
  );
};

export default TableHeader;
