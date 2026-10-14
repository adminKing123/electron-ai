import React from "react";
import { Position } from "@xyflow/react";
import FuseNodeRowContent from "../FuseNodeRowContent";
import { fuseCanvasNodeRowClass } from "../fuseNodeTheme";
import FuseNodeHandle from "./FuseNodeHandle";

const DefaultFlowNode = ({ data, selected }) => (
  <div className={fuseCanvasNodeRowClass(selected, data.runStatus)}>
    {!data.isStarter && (
      <FuseNodeHandle type="target" position={Position.Top} />
    )}

    <FuseNodeRowContent iconName={data.icon} label={data.label} />

    <FuseNodeHandle type="source" position={Position.Bottom} />
  </div>
);

export default DefaultFlowNode;
