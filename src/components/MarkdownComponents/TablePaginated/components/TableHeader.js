const TableHeader = ({ limit, onLimitChange }) => {
  return (
    <div className="px-4 sm:px-[18px] py-2 bg-[#fafafa] dark:bg-[#252525] border-b border-[#E4E4E4] dark:border-[#454545] flex justify-end items-center gap-2">
      <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
        Rows per page:
      </span>
      <select
        value={limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className="px-2 py-1 text-xs border border-gray-300 dark:border-[#4E4E4E] rounded bg-white dark:bg-[#2F2F2F] text-gray-700 dark:text-gray-200 cursor-pointer"
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

export default TableHeader;
