import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getNodeIcon } from "../iconRegistry";

// ─── ScheduleNode ─────────────────────────────────────────────────────────────
// Canvas node for the "On a Schedule" starter trigger.
// This node is a starter — it never has an incoming (target) handle because
// nothing connects INTO a workflow trigger.
// Design this component however you like; no style is inherited from elsewhere.
const ScheduleNode = ({ id, data, selected }) => {
  const Icon = getNodeIcon(data.icon);

  const borderCls = selected
    ? "border-[#059669] dark:border-[#34d399] shadow-[0_0_0_3px_rgba(5,150,105,0.18)]"
    : "border-[#a7f3d0] dark:border-[#065f46] shadow-sm hover:border-[#10b981] dark:hover:border-[#047857]";

  return (
    <div
      className={[
        "flex items-center justify-center flex-col gap-2.5 px-3.5 py-2.5 rounded-full w-[140px] h-[140px]",
        "bg-[#ecfdf5] dark:bg-[#062c1e]",
        "border-2 transition-colors select-none",
        "cursor-pointer",
        borderCls,
      ].join(" ")}
    >
      {/* No target handle — schedule is always a starter node */}

      {/* Icon */}
      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#d1fae5] dark:bg-[#022c22]">
        {Icon
          ? <Icon className="w-[24px] h-[24px] text-[#059669] dark:text-[#34d399]" />
          : <span className="w-3 h-3 rounded-full bg-[#a7f3d0] dark:bg-[#065f46]" />
        }
      </span>

      {/* Label block */}
      <div className="flex flex-col min-w-0 text-center">
        <span className="text-[13px] font-semibold leading-tight text-[#064e3b] dark:text-[#6ee7b7] truncate">
          {data.label}
        </span>
      </div>

      {/* Source handle — bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#a7f3d0] dark:!border-[#065f46] !bg-[#ecfdf5] dark:!bg-[#062c1e]"
      />
    </div>
  );
};

export default ScheduleNode;
