import { MdArrowUpward, MdArrowDownward, MdUnfoldMore } from "react-icons/md";

const TableBody = ({ cols, data, sorts = [], onSortChange, sortableColumns = [] }) => {
  const isSortable = (columnKey) => sortableColumns.includes(columnKey);
  
  const getSortState = (columnKey) => {
    const sortIndex = sorts.findIndex(s => s.column === columnKey);
    if (sortIndex === -1) return null;
    return sorts[sortIndex];
  };

  const getSortIcon = (columnKey) => {
    const sortState = getSortState(columnKey);
    const isSortableCol = isSortable(columnKey);
    
    if (!isSortableCol) return null;
    
    if (!sortState) {
      // Show faded unsorted icon for sortable columns  
      return <MdUnfoldMore className="inline ml-1 h-3 w-3 opacity-30" />;
    }
    
    // Show active sort icon
    return sortState.order === "asc" ? (
      <MdArrowUpward className="inline ml-1 h-3 w-3 text-brand-600 dark:text-brand-400" />
    ) : (
      <MdArrowDownward className="inline ml-1 h-3 w-3 text-brand-600 dark:text-brand-400" />
    );
  };

  return (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
      <table className="hidden sm:table w-full text-xs">
        <thead className="bg-ink-25 dark:bg-ink-850 border-b border-ink-100 dark:border-ink-800">
          <tr>
            {cols.map((col, idx) => {
              const sortable = isSortable(col._k);
              const sortState = getSortState(col._k);
              return (
                <th
                  key={idx}
                  className={`px-4 py-3 text-left font-semibold text-ink-725 dark:text-ink-200 whitespace-nowrap ${
                    sortable ? "cursor-pointer select-none hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors" : ""
                  } ${
                    sortState ? "bg-brand-50 dark:bg-brand-900/20" : ""
                  }`}
                  onClick={() => sortable && onSortChange(col._k)}
                  title={sortable ? (sortState ? `Sorted ${sortState.order}ending - Click to change` : "Click to sort") : ""}
                >
                  {col._v}
                  {getSortIcon(col._k)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-ink-100 dark:border-ink-800 hover:bg-ink-25 dark:hover:bg-ink-825 transition-colors"
            >
              {cols.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className="px-4 py-2.5 text-[12px] text-ink-750 dark:text-ink-350"
                >
                  {row[col._k] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableBody;
