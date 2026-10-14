import React from "react";
import { Handle, Position } from "@xyflow/react";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "../FuseNodeIcon";
import { FUSE_STARTER_NODE_SIZE, FuseNodeLabel } from "./nodeLayout";

// ─── WebexMessageNode ─────────────────────────────────────────────────────────
// Canvas node for the "On Webex Message" starter trigger.
const WebexMessageNode = ({ id, data, selected }) => {
  const borderCls = selected
    ? "border-[#0073b7] dark:border-[#38bdf8] shadow-[0_0_0_3px_rgba(0,115,183,0.18)]"
    : "border-[#bae6fd] dark:border-[#0c4a6e] shadow-sm hover:border-[#0284c7] dark:hover:border-[#0369a1]";

  return (
    <div
      className={[
        "flex items-center justify-center flex-col gap-2.5 px-3.5 py-2.5 rounded-full",
        FUSE_STARTER_NODE_SIZE,
        "bg-[#f0f9ff] dark:bg-[#0c1929]",
        "border-2 transition-colors select-none",
        "cursor-pointer",
        borderCls,
      ].join(" ")}
    >
      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
        <FuseNodeIcon iconName={data.icon} sizeClass={FUSE_NODE_ICON_SIZES.canvasLg} />
      </span>

      <div className="w-full min-w-0 overflow-hidden text-center">
        <FuseNodeLabel
          label={data.label}
          className="text-[13px] font-semibold leading-tight text-[#0c4a6e] dark:text-[#7dd3fc]"
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#bae6fd] dark:!border-[#0c4a6e] !bg-[#f0f9ff] dark:!bg-[#0c1929]"
      />
    </div>
  );
};

export default WebexMessageNode;
