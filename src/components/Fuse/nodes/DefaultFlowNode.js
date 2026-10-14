import React from "react";
import { Handle, Position } from "@xyflow/react";
import FuseNodeRowContent from "../FuseNodeRowContent";
import { fuseCanvasNodeRowClass, FUSE_NODE_HANDLE } from "../fuseNodeTheme";

const DefaultFlowNode = ({ data, selected }) => (
  <div className={fuseCanvasNodeRowClass(selected)}>
    {!data.isStarter && (
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-3 !h-3 !border-2 ${FUSE_NODE_HANDLE}`}
      />
    )}

    <FuseNodeRowContent iconName={data.icon} label={data.label} />

    <Handle
      type="source"
      position={Position.Bottom}
      className={`!w-3 !h-3 !border-2 ${FUSE_NODE_HANDLE}`}
    />
  </div>
);

export default DefaultFlowNode;
