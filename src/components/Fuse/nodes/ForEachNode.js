import React from "react";
import { Position } from "@xyflow/react";
import FuseNodeRowContent from "../FuseNodeRowContent";
import {
  FUSE_NODE_LABEL_MUTED,
  FUSE_NODE_ROW_INNER,
  FUSE_NODE_ROW_WIDTH,
  FUSE_PICKER_ROW,
} from "../fuseNodeTheme";
import FuseNodeHandle from "./FuseNodeHandle";

const ForEachNode = ({ data, selected }) => (
  <div
    className={[
      FUSE_NODE_ROW_WIDTH,
      "rounded-2xl overflow-visible",
      FUSE_PICKER_ROW,
      selected ? "ring-2 ring-[#1a73e8]/20 dark:ring-[#8ab4f8]/25" : "",
    ].join(" ")}
  >
    <div className={FUSE_NODE_ROW_INNER}>
      <FuseNodeHandle
        type="target"
        position={Position.Top}
        className="!rounded-none"
      />
      <FuseNodeRowContent iconName={data.icon} label={data.label} />
    </div>

    <div className="flex border-t border-[#dadce0] dark:border-[#3c4043] overflow-visible">
      <div className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 pb-3 min-w-0 px-1">
        <span className="w-2 h-2 rounded-full bg-[#1a73e8] flex-shrink-0" />
        <span className={`text-[10px] font-semibold truncate ${FUSE_NODE_LABEL_MUTED}`}>
          For each item
        </span>
        <FuseNodeHandle
          type="source"
          position={Position.Bottom}
          id="item"
          style={{ left: "50%", bottom: 0 }}
        />
      </div>
      <div className="w-px bg-[#dadce0] dark:bg-[#3c4043]" />
      <div className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 pb-3 min-w-0 px-1">
        <span className="w-2 h-2 rounded-full bg-[#5f6368] flex-shrink-0" />
        <span className={`text-[10px] font-semibold truncate ${FUSE_NODE_LABEL_MUTED}`}>
          Done
        </span>
        <FuseNodeHandle
          type="source"
          position={Position.Bottom}
          id="done"
          style={{ left: "50%", bottom: 0 }}
        />
      </div>
    </div>
  </div>
);

export default ForEachNode;
