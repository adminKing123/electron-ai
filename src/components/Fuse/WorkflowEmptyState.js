import { TbBolt } from "react-icons/tb";

/**
 * Shown inside the workflow table when there are no workflows yet.
 * Rendered as a full-width table row spanning all columns.
 */
const WorkflowEmptyState = () => (
  <tr>
    <td colSpan={5}>
      <div className="flex flex-col items-center justify-center py-20 text-center select-none">
        <div className="w-11 h-11 rounded-2xl bg-[#e87c10]/10 flex items-center justify-center mb-4">
          <TbBolt className="w-5 h-5 text-[#e87c10]" />
        </div>
        <p className="text-[13px] font-semibold text-[#333] dark:text-[#ccc]">
          No workflows yet
        </p>
        <p className="text-xs text-[#aaa] dark:text-[#555] mt-1">
          Hit{" "}
          <span className="font-medium text-[#111] dark:text-white">
            Create New
          </span>{" "}
          to build your first flow.
        </p>
      </div>
    </td>
  </tr>
);

export default WorkflowEmptyState;
