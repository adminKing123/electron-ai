import React from "react";
import { Position } from "@xyflow/react";
import FuseNodeRowContent from "../FuseNodeRowContent";
import {
  FUSE_NODE_LABEL_MUTED,
  FUSE_NODE_ROW_INNER,
  FUSE_NODE_ROW_WIDTH,
  fuseCanvasNodeShellClass,
} from "../fuseNodeTheme";
import FuseNodeHandle from "./FuseNodeHandle";
import FuseRunNodeGalaxySpinner from "../FuseRunNodeGalaxySpinner";

const IfElseNode = ({ data, selected }) => (
  <div
    className={[
      FUSE_NODE_ROW_WIDTH,
      "rounded-2xl overflow-visible",
      fuseCanvasNodeShellClass(selected, data.runStatus),
    ].join(" ")}
  >
    {data.runStatus === "running" && <FuseRunNodeGalaxySpinner />}
    <div className={FUSE_NODE_ROW_INNER}>
      <FuseNodeHandle
        type="target"
        position={Position.Top}
        className="!rounded-none"
      />
      <FuseNodeRowContent iconName={data.icon} label={data.label} />
    </div>

    <div className="flex border-t border-ink-200 dark:border-ink-725 overflow-visible">
      <div className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 pb-3 min-w-0">
        <span className="w-2 h-2 rounded-full bg-[#188038] flex-shrink-0" />
        <span className={`text-[11px] font-semibold ${FUSE_NODE_LABEL_MUTED}`}>True</span>
        <FuseNodeHandle
          type="source"
          position={Position.Bottom}
          id="true"
          style={{ left: "50%", bottom: 0 }}
        />
      </div>
      <div className="w-px bg-ink-200 dark:bg-ink-725" />
      <div className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 pb-3 min-w-0">
        <span className="w-2 h-2 rounded-full bg-[#d93025] flex-shrink-0" />
        <span className={`text-[11px] font-semibold ${FUSE_NODE_LABEL_MUTED}`}>False</span>
        <FuseNodeHandle
          type="source"
          position={Position.Bottom}
          id="false"
          style={{ left: "50%", bottom: 0 }}
        />
      </div>
    </div>
  </div>
);

export default IfElseNode;
