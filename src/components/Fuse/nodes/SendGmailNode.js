import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getNodeIcon } from "../iconRegistry";
import { getDisplayFuseNodeId } from "../../../utils/helpers";

// ─── SendGmailNode ──────────────────────────────────────────────────────────
// Canvas node for the "Send Gmail" action.
// Red / Orange colour scheme to match the Gmail branding.
const SendGmailNode = ({ id, data, selected }) => {
  const Icon = getNodeIcon(data.icon);

  const borderCls = selected
    ? "border-[#ea4335] dark:border-[#f87171] shadow-[0_0_0_3px_rgba(234,67,53,0.18)]"
    : "border-[#fecaca] dark:border-[#991b1b] shadow-sm hover:border-[#ef4444] dark:hover:border-[#dc2626]";

  return (
    <div
      className={[
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl",
        "bg-[#fef2f2] dark:bg-[#2e0a0a]",
        "border-2 transition-colors select-none",
        "min-w-[190px] max-w-[260px] cursor-pointer",
        borderCls,
      ].join(" ")}
    >
      {/* Target (input) handle — top center */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[#fecaca] dark:!border-[#991b1b] !bg-[#fef2f2] dark:!bg-[#2e0a0a] !rounded-none"
      />

      {/* Icon */}
      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#fee2e2] dark:bg-[#450a0a]">
        {Icon
          ? <Icon className="w-[24px] h-[24px] text-[#ea4335] dark:text-[#f87171]" />
          : <span className="w-3 h-3 rounded-full bg-[#fecaca] dark:bg-[#991b1b]" />
        }
      </span>

      {/* Label block */}
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-semibold leading-tight text-[#991b1b] dark:text-[#fca5a5] truncate">
          {data.label}
        </span>
        <span className="text-[9px] font-mono leading-tight text-[#f87171] dark:text-[#dc2626] truncate select-all">
          NODE {getDisplayFuseNodeId(id)}
        </span>
      </div>

      {/* Source handle — bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#fecaca] dark:!border-[#991b1b] !bg-[#fef2f2] dark:!bg-[#2e0a0a]"
      />
    </div>
  );
};

export default SendGmailNode;
