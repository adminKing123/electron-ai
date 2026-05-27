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
        <MdSearch className="h-3.5 w-3.5 text-[#aaa] dark:text-[#555]" />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search..."
        className="block w-full pl-7 pr-7 py-1.5 text-[12px]
                   border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg
                   bg-white dark:bg-[#252525]
                   text-[#333] dark:text-[#ccc]
                   placeholder:text-[#bbb] dark:placeholder:text-[#444]
                   focus:outline-none focus:ring-1 focus:ring-[#ccc] dark:focus:ring-[#444]
                   transition-colors"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer
                     text-[#aaa] hover:text-[#555] dark:text-[#555] dark:hover:text-[#aaa]
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
      <span className="text-[11px] text-[#888] dark:text-[#555] whitespace-nowrap">
        Rows per page:
      </span>
      <select
        value={limit}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-2 py-1.5 text-[12px]
                   border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg
                   bg-white dark:bg-[#252525]
                   text-[#333] dark:text-[#ccc]
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
    <div className="px-4 py-2 bg-[#f8f8f8] dark:bg-[#1a1a1a] border-b border-[#e8e8e8] dark:border-[#2a2a2a]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        {hasSearch && <SearchInput value={search} onChange={onSearchChange} />}

        <RowsPerPageSelector limit={limit} onChange={onLimitChange} />
      </div>
    </div>
  );
};

export default TableHeader;
