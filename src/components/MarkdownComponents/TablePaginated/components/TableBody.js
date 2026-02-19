const TableBody = ({ cols, data }) => {
  return (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
      <table className="hidden sm:table w-full text-xs">
        <thead className="bg-gray-50 dark:bg-[#252525] border-b border-[#E4E4E4] dark:border-[#454545]">
          <tr>
            {cols.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                {col._v}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-[#E4E4E4] dark:border-[#454545] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
            >
              {cols.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className="px-4 py-3 text-gray-800 dark:text-gray-200"
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
