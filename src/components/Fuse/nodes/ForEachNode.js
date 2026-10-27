import React from "react";
import FuseBranchCardNode from "./FuseBranchCardNode";

const BRANCHES = [
  { id: "item", label: "Each", dot: "brand" },
  { id: "done", label: "Done", dot: "muted" },
];

const ForEachNode = (props) => (
  <FuseBranchCardNode
    {...props}
    branches={BRANCHES}
    defaultTitle="For each"
  />
);

export default ForEachNode;
