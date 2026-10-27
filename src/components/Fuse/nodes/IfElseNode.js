import React from "react";
import FuseBranchCardNode from "./FuseBranchCardNode";

const BRANCHES = [
  { id: "true", label: "True", dot: "success" },
  { id: "false", label: "False", dot: "danger" },
];

const IfElseNode = (props) => (
  <FuseBranchCardNode
    {...props}
    branches={BRANCHES}
    defaultTitle="If / Else"
  />
);

export default IfElseNode;
