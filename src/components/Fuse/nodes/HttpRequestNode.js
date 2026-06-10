import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getNodeIcon } from "../iconRegistry";

// ─── HttpRequestNode ───────────────────────────────────────────────────────────
// Canvas node for the "HTTP Request" action.
// Teal / cyan colour scheme to visually distinguish it from other node types.
// Has a target handle (top) to accept an incoming connection and a source
// handle (bottom) to continue the workflow chain.
const HttpRequestNode = ({ id, data, selected }) => {
  const Icon = getNodeIcon(data.icon);

  const borderCls = selected
    ? "border-[#0d9488] dark:border-[#2dd4bf] shadow-[0_0_0_3px_rgba(13,148,136,0.18)]"
    : "border-[#99f6e4] dark:border-[#134e4a] shadow-sm hover:border-[#0d9488] dark:hover:border-[#0f766e]";

  return (
    <div
      className={[
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl",
        "bg-[#f0fdfa] dark:bg-[#0a2020]",
        "border-2 transition-colors select-none",
        "min-w-[190px] max-w-[260px] cursor-pointer",
        borderCls,
      ].join(" ")}
    >
      {/* Target (input) handle — top center */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[#99f6e4] dark:!border-[#134e4a] !bg-[#f0fdfa] dark:!bg-[#0a2020] !rounded-none"
      />

      {/* Icon */}
      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#ccfbf1] dark:bg-[#134e4a]">
        {Icon
          ? <Icon className="w-[22px] h-[22px] text-[#0d9488] dark:text-[#2dd4bf]" />
          : <span className="w-3 h-3 rounded-full bg-[#99f6e4] dark:bg-[#0f766e]" />
        }
      </span>

      {/* Label block */}
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-semibold leading-tight text-[#115e59] dark:text-[#5eead4] truncate">
          {data.label}
        </span>
        <span className="text-[9px] font-mono leading-tight text-[#2dd4bf] dark:text-[#0f766e] truncate select-all">
          {id}
        </span>
      </div>

      {/* Source handle — bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#99f6e4] dark:!border-[#134e4a] !bg-[#f0fdfa] dark:!bg-[#0a2020]"
      />
    </div>
  );
};

export default HttpRequestNode;
