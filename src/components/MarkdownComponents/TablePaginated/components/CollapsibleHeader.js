import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { CiViewTable } from "react-icons/ci";

const CollapsibleHeader = ({ tableName, isExpanded, onToggle }) => {
  return (
    <div
      className="px-4 py-2.5 bg-[#f0f0f0] dark:bg-[#1e1e1e] border-b border-[#e8e8e8] dark:border-[#2a2a2a] flex justify-between items-center cursor-pointer hover:bg-[#e8e8e8] dark:hover:bg-[#252525] transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2.5">
        <CiViewTable className="w-[15px] h-[15px] text-[#888] dark:text-[#555] flex-shrink-0" />
        <div className="text-[13px] font-medium text-[#111] dark:text-white tracking-tight">
          {tableName || "Table View"}
        </div>
      </div>
      <button
        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#888] dark:text-[#555] hover:text-[#111] dark:hover:text-white hover:bg-[#e0e0e0] dark:hover:bg-[#2a2a2a] transition-colors"
        title={isExpanded ? "Collapse table" : "Expand table"}
        aria-label={isExpanded ? "Collapse table" : "Expand table"}
      >
        {isExpanded ? <MdExpandLess className="w-[16px] h-[16px]" /> : <MdExpandMore className="w-[16px] h-[16px]" />}
      </button>
    </div>
  );
};

export default CollapsibleHeader;
