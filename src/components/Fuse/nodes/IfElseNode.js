import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getNodeIcon } from "../iconRegistry";

// ─── IfElseNode ───────────────────────────────────────────────────────────────
// Distinct yellow card for the If / Else branching node.
// Renders a True and False source handle in the footer so each branch can be
// wired independently on the canvas.
const IfElseNode = ({ id, data, selected }) => {
  const Icon = getNodeIcon(data.icon);

  const borderCls = selected
    ? "border-[#f59e0b] shadow-[0_0_0_3px_rgba(245,158,11,0.18)]"
    : "border-[#fcd34d] dark:border-[#6b4c00] shadow-sm hover:border-[#f59e0b] dark:hover:border-[#b07800]";

  return (
    <div
      className={[
        "flex flex-col rounded-b-lg rounded-t-[60px] select-none cursor-pointer transition-colors",
        "bg-[#fffbeb] dark:bg-[#1c1800]",
        "border-2 min-w-[160px]",
        borderCls,
      ].join(" ")}
    >
      {/* Incoming handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[#fcd34d] dark:!border-[#6b4c00] !bg-[#fffbeb] dark:!bg-[#1c1800] !rounded-none"
      />

      {/* Header: icon + label */}
      <div className="flex items-center flex-col gap-2.5 px-3.5 pt-3 pb-2.5">
        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg
          bg-[#fef3c7] dark:bg-[#2a2000]">
          {Icon
            ? <Icon className="w-[24px] h-[24px] text-[#d97706] dark:text-[#f59e0b]" />
            : <span className="w-3 h-3 rounded-sm bg-[#fcd34d]" />
          }
        </span>
        <div className="flex flex-col min-w-0 text-center">
          <span className="text-[13px] font-semibold leading-tight text-[#92400e] dark:text-[#fbbf24] truncate">
            {data.label}
          </span>
          <span className="text-[9px] font-mono leading-tight text-[#d4a535] dark:text-[#5c3d00] truncate select-all">
            {id}
          </span>
        </div>
      </div>

      {/* True / False branch footer */}
      <div className="flex border-t border-[#fde68a] dark:border-[#2e2000]">
        {/* True cell */}
        <div className="relative flex-1 flex items-center justify-center gap-1.5 py-2">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] dark:bg-[#16a34a] flex-shrink-0" />
          <span className="text-[11px] font-semibold text-[#16a34a] dark:text-[#4ade80]">True</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ left: "50%", bottom: 0 }}
            className="!w-3 !h-3 !border-2 !border-[#22c55e] dark:!border-[#16a34a] !bg-white dark:!bg-[#1c1800]"
          />
        </div>

        {/* Divider */}
        <div className="w-px bg-[#fde68a] dark:bg-[#2e2000]" />

        {/* False cell */}
        <div className="relative flex-1 flex items-center justify-center gap-1.5 py-2">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] dark:bg-[#dc2626] flex-shrink-0" />
          <span className="text-[11px] font-semibold text-[#dc2626] dark:text-[#f87171]">False</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ left: "50%", bottom: 0 }}
            className="!w-3 !h-3 !border-2 !border-[#ef4444] dark:!border-[#dc2626] !bg-white dark:!bg-[#1c1800]"
          />
        </div>
      </div>
    </div>
  );
};

export default IfElseNode;
