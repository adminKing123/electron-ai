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
        <MdSearch className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search..."
        className="block w-full pl-8 pr-8 py-1 text-xs border border-gray-300 dark:border-[#4E4E4E] rounded 
                   bg-white dark:bg-[#2F2F2F] text-gray-700 dark:text-gray-200 
                   placeholder-gray-400 dark:placeholder-gray-500
                   focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500
                   transition-colors duration-200"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer
                     text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                     transition-colors duration-200"
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
      <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
        Rows per page:
      </span>
      <select
        value={limit}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-2 py-1 text-xs border border-gray-300 dark:border-[#4E4E4E] rounded 
                   bg-white dark:bg-[#2F2F2F] text-gray-700 dark:text-gray-200 cursor-pointer
                   focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500
                   transition-colors duration-200"
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
    <div className="px-4 sm:px-[18px] py-2 bg-[#fafafa] dark:bg-[#252525] border-b border-[#E4E4E4] dark:border-[#454545]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        {hasSearch && <SearchInput value={search} onChange={onSearchChange} />}

        <RowsPerPageSelector limit={limit} onChange={onLimitChange} />
      </div>
    </div>
  );
};

export default TableHeader;
