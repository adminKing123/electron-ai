import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getNodeIcon } from "../iconRegistry";

// ─── AiStructuredOutputNode ───────────────────────────────────────────────────
// Canvas node for the "AI Structured Output" action.
// Has a target handle (top) to receive connections and a source handle
// (bottom) to continue the chain.
// Design this component however you like; no style is inherited from elsewhere.
const AiStructuredOutputNode = ({ id, data, selected }) => {
  const Icon = getNodeIcon(data.icon);

  const borderCls = selected
    ? "border-[#9333ea] dark:border-[#c084fc] shadow-[0_0_0_3px_rgba(147,51,234,0.18)]"
    : "border-[#e9d5ff] dark:border-[#4c1d95] shadow-sm hover:border-[#a855f7] dark:hover:border-[#7e22ce]";

  return (
    <div
      className={[
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl",
        "bg-[#faf5ff] dark:bg-[#1f102c]",
        "border-2 transition-colors select-none",
        "min-w-[190px] max-w-[260px] cursor-pointer",
        borderCls,
      ].join(" ")}
    >
      {/* Target (input) handle — top center */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[#e9d5ff] dark:!border-[#4c1d95] !bg-[#faf5ff] dark:!bg-[#1f102c] !rounded-none"
      />

      {/* Icon */}
      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#f3e8ff] dark:bg-[#3b0764]">
        {Icon
          ? <Icon className="w-[24px] h-[24px] text-[#9333ea] dark:text-[#c084fc]" />
          : <span className="w-3 h-3 rounded-full bg-[#e9d5ff] dark:bg-[#4c1d95]" />
        }
      </span>

      {/* Label block */}
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-semibold leading-tight text-[#4c1d95] dark:text-[#d8b4fe] truncate">
          {data.label}
        </span>
        <span className="text-[9px] font-mono leading-tight text-[#c084fc] dark:text-[#581c87] truncate select-all">
          {id}
        </span>
      </div>

      {/* Source handle — bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#e9d5ff] dark:!border-[#4c1d95] !bg-[#faf5ff] dark:!bg-[#1f102c]"
      />
    </div>
  );
};

export default AiStructuredOutputNode;
