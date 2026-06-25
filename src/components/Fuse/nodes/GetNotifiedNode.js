import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getNodeIcon } from "../iconRegistry";
import { getDisplayFuseNodeId } from "../../../utils/helpers";

// ─── GetNotifiedNode ──────────────────────────────────────────────────────────
// Canvas node for the "Get Notified" action.
// Has a target handle (top) to receive connections and a source handle
// (bottom) to continue the chain.
// Design this component however you like; no style is inherited from elsewhere.
const GetNotifiedNode = ({ id, data, selected }) => {
  const Icon = getNodeIcon(data.icon);

  const borderCls = selected
    ? "border-[#2563eb] dark:border-[#60a5fa] shadow-[0_0_0_3px_rgba(37,99,235,0.18)]"
    : "border-[#bfdbfe] dark:border-[#1e3a8a] shadow-sm hover:border-[#3b82f6] dark:hover:border-[#1d4ed8]";

  return (
    <div
      className={[
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl",
        "bg-[#eff6ff] dark:bg-[#0c1a30]",
        "border-2 transition-colors select-none",
        "min-w-[190px] max-w-[260px] cursor-pointer",
        borderCls,
      ].join(" ")}
    >
      {/* Target (input) handle — top center */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[#bfdbfe] dark:!border-[#1e3a8a] !bg-[#eff6ff] dark:!bg-[#0c1a30] !rounded-none"
      />

      {/* Icon */}
      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#dbeafe] dark:bg-[#172554]">
        {Icon
          ? <Icon className="w-[24px] h-[24px] text-[#2563eb] dark:text-[#60a5fa]" />
          : <span className="w-3 h-3 rounded-full bg-[#bfdbfe] dark:bg-[#1e3a8a]" />
        }
      </span>

      {/* Label block */}
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-semibold leading-tight text-[#1e3a8a] dark:text-[#93c5fd] truncate">
          {data.label}
        </span>
        <span className="text-[9px] font-mono leading-tight text-[#60a5fa] dark:text-[#1d4ed8] truncate select-all">
          NODE {getDisplayFuseNodeId(id)}
        </span>
      </div>

      {/* Source handle — bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#bfdbfe] dark:!border-[#1e3a8a] !bg-[#eff6ff] dark:!bg-[#0c1a30]"
      />
    </div>
  );
};

export default GetNotifiedNode;
