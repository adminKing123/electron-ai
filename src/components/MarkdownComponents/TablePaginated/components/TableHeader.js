const TableHeader = ({ tableName, limit, onLimitChange }) => {
  return (
    <div className="px-4 sm:px-[18px] py-2 bg-[#f1f1f1] dark:bg-[#292929] rounded-t-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div className="font-semibold text-black dark:text-white text-xs truncate w-full sm:w-auto">
        {tableName || "Table View"}
      </div>
      <div className="flex items-center gap-2">
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
    </div>
  );
};

export default TableHeader;
