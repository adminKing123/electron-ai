import React from "react";
import { Handle, Position } from "@xyflow/react";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "../FuseNodeIcon";
import { FUSE_ACTION_NODE_WIDTH, FuseNodeIdLabel, FuseNodeLabel } from "./nodeLayout";

// ─── AiGenerateTextNode ───────────────────────────────────────────────────────
// Canvas node for the "Generate Text" action.
const AiGenerateTextNode = ({ id, data, selected }) => {
  const borderCls = selected
    ? "border-[#2563eb] dark:border-[#60a5fa] shadow-[0_0_0_3px_rgba(37,99,235,0.18)]"
    : "border-[#bfdbfe] dark:border-[#1e3a8a] shadow-sm hover:border-[#2563eb] dark:hover:border-[#1d4ed8]";

  return (
    <div
      className={[
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl",
        "bg-[#eff6ff] dark:bg-[#0f172a]",
        "border-2 transition-colors select-none cursor-pointer",
        FUSE_ACTION_NODE_WIDTH,
        borderCls,
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[#bfdbfe] dark:!border-[#1e3a8a] !bg-[#eff6ff] dark:!bg-[#0f172a] !rounded-none"
      />

      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
        <FuseNodeIcon iconName={data.icon} sizeClass={FUSE_NODE_ICON_SIZES.canvas} />
      </span>

      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <FuseNodeLabel
          label={data.label}
          className="text-[13px] font-semibold leading-tight text-[#1e3a8a] dark:text-[#93c5fd]"
        />
        <FuseNodeIdLabel
          id={id}
          className="text-[9px] font-mono leading-tight text-[#60a5fa] dark:text-[#1e40af]"
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#bfdbfe] dark:!border-[#1e3a8a] !bg-[#eff6ff] dark:!bg-[#0f172a]"
      />
    </div>
  );
};

export default AiGenerateTextNode;
