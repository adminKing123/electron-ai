import React from "react";
import { Handle, Position } from "@xyflow/react";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "../FuseNodeIcon";
import { FUSE_FOR_EACH_NODE_WIDTH, FuseNodeIdLabel, FuseNodeLabel } from "./nodeLayout";

// ─── ForEachNode ──────────────────────────────────────────────────────────────
// Blue card for the "For Each Item" loop node.
// Has two source handles in the footer:
//   • "item"  — runs once for every element in the array  (blue)
//   • "done"  — continues after all iterations finish     (slate)
const ForEachNode = ({ id, data, selected }) => {
  const borderCls = selected
    ? "border-[#3b82f6] shadow-[0_0_0_3px_rgba(59,130,246,0.18)]"
    : "border-[#93c5fd] dark:border-[#1e3a5f] shadow-sm hover:border-[#3b82f6] dark:hover:border-[#2563eb]";

  return (
    <div
      className={[
        "flex flex-col rounded-b-lg rounded-t-[60px] select-none cursor-pointer transition-colors",
        "bg-[#eff6ff] dark:bg-[#0f172a]",
        "border-2",
        FUSE_FOR_EACH_NODE_WIDTH,
        borderCls,
      ].join(" ")}
    >
      {/* Incoming handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[#93c5fd] dark:!border-[#1e3a5f] !bg-[#eff6ff] dark:!bg-[#0f172a] !rounded-none"
      />

      {/* Header: icon + label */}
      <div className="flex items-center flex-col gap-2.5 px-3.5 pt-3 pb-2.5">
        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
          <FuseNodeIcon iconName={data.icon} sizeClass={FUSE_NODE_ICON_SIZES.canvasLg} />
        </span>
        <div className="w-full min-w-0 overflow-hidden text-center">
          <FuseNodeLabel
            label={data.label}
            className="text-[13px] font-semibold leading-tight text-[#1e40af] dark:text-[#93c5fd]"
          />
          <FuseNodeIdLabel
            id={id}
            className="text-[9px] font-mono leading-tight text-[#60a5fa] dark:text-[#1e3a5f]"
          />
        </div>
      </div>

      {/* For each item / Done footer */}
      <div className="flex border-t border-[#bfdbfe] dark:border-[#1e3a5f] overflow-visible">
        {/* For each item cell */}
        <div className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 pb-3 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6] dark:bg-[#2563eb] flex-shrink-0" />
          <span className="text-[10px] font-semibold text-[#1d4ed8] dark:text-[#60a5fa] truncate">
            For each item
          </span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="item"
            style={{ left: "50%", bottom: 0 }}
            className="!w-3 !h-3 !border-2 !border-[#3b82f6] dark:!border-[#2563eb] !bg-white dark:!bg-[#0f172a]"
          />
        </div>

        {/* Divider */}
        <div className="w-px bg-[#bfdbfe] dark:bg-[#1e3a5f]" />

        {/* Done cell */}
        <div className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 pb-3 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#64748b] dark:bg-[#475569] flex-shrink-0" />
          <span className="text-[10px] font-semibold text-[#475569] dark:text-[#94a3b8] truncate">
            Done
          </span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="done"
            style={{ left: "50%", bottom: 0 }}
            className="!w-3 !h-3 !border-2 !border-[#64748b] dark:!border-[#475569] !bg-white dark:!bg-[#0f172a]"
          />
        </div>
      </div>
    </div>
  );
};

export default ForEachNode;
