import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { CiViewTable } from "react-icons/ci";

const CollapsibleHeader = ({ tableName, isExpanded, onToggle }) => {
  return (
    <div
      className="px-4 py-2.5 bg-ink-75 dark:bg-void-825 border-b border-ink-100 dark:border-void-800 flex justify-between items-center cursor-pointer hover:bg-ink-100 dark:hover:bg-void-800 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2.5">
        <CiViewTable className="w-[15px] h-[15px] text-ink-500 dark:text-ink-550 flex-shrink-0" />
        <div className="text-[13px] font-medium text-ink-975 dark:text-white tracking-tight">
          {tableName || "Table View"}
        </div>
      </div>
      <button
        className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-500 dark:text-ink-550 hover:text-ink-975 dark:hover:text-white hover:bg-ink-150 dark:hover:bg-void-800 transition-colors"
        title={isExpanded ? "Collapse table" : "Expand table"}
        aria-label={isExpanded ? "Collapse table" : "Expand table"}
      >
        {isExpanded ? <MdExpandLess className="w-[16px] h-[16px]" /> : <MdExpandMore className="w-[16px] h-[16px]" />}
      </button>
    </div>
  );
};

export default CollapsibleHeader;
