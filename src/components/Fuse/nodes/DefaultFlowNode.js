import React from "react";
import FuseCanvasNode from "./FuseCanvasNode";

const DefaultFlowNode = ({ data, selected }) => (
  <FuseCanvasNode data={data} selected={selected} />
);

export default DefaultFlowNode;
