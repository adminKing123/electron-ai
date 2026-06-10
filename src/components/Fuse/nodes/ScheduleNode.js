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

  return (
    <div
      className={[
        "flex items-center justify-center flex-col gap-2.5 px-3.5 py-2.5 rounded-full w-[140px] h-[140px]",
        "bg-white dark:bg-[#1c1c1c]",
        "border-2 transition-colors select-none",
        "cursor-pointer",
        selected
          ? "border-[#4a6cf7] dark:border-[#6b8aff] shadow-[0_0_0_3px_rgba(74,108,247,0.15)]"
          : "border-[#e0e0e0] dark:border-[#2a2a2a] shadow-sm hover:border-[#b0bef0] dark:hover:border-[#363660]",
      ].join(" ")}
    >
      {/* No target handle — schedule is always a starter node */}

      {/* Icon */}
      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#eef0fb] dark:bg-[#252540]">
        {Icon
          ? <Icon className="w-[24px] h-[24px] text-[#4a6cf7] dark:text-[#6b8aff]" />
          : <span className="w-3 h-3 rounded-full bg-[#c0c8e8] dark:bg-[#444]" />
        }
      </span>

      {/* Label block */}
      <div className="flex flex-col min-w-0 text-center">
        <span className="text-[13px] font-semibold leading-tight text-[#111] dark:text-[#e8e8e8] truncate">
          {data.label}
        </span>
      </div>

      {/* Source handle — bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#c0c8f0] dark:!border-[#363660] !bg-white dark:!bg-[#1c1c1c]"
      />
    </div>
  );
};

export default ScheduleNode;
