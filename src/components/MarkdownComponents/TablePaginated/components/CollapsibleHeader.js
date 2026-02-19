import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { CiViewTable } from "react-icons/ci";

const CollapsibleHeader = ({ tableName, isExpanded, onToggle }) => {
  return (
    <div
      className="px-4 sm:px-[18px] py-3 bg-[#f1f1f1] dark:bg-[#292929] rounded-t-2xl flex justify-between items-center cursor-pointer hover:bg-[#e8e8e8] dark:hover:bg-[#333333]"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <CiViewTable className="text-xl text-gray-700 dark:text-gray-200" />
        <div className="font-bold text-black dark:text-white text-sm">
          {tableName || "Table View"}
        </div>
      </div>
      <button
        className="p-1.5 text-xl text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-[#2F2F2F] rounded"
        title={isExpanded ? "Collapse table" : "Expand table"}
        aria-label={isExpanded ? "Collapse table" : "Expand table"}
      >
        {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
      </button>
    </div>
  );
};

export default CollapsibleHeader;
