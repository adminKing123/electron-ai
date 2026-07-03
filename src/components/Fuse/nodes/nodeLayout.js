import React from "react";
import { getDisplayFuseNodeId } from "../../../utils/helpers";

/** Fixed canvas dimensions — keep in sync across all node variants. */
export const FUSE_STARTER_NODE_SIZE = "w-[140px] h-[140px] min-w-[140px] max-w-[140px] shrink-0";
export const FUSE_ACTION_NODE_WIDTH = "w-[220px] min-w-[220px] max-w-[220px] shrink-0";
export const FUSE_IF_ELSE_NODE_WIDTH = "w-[200px] min-w-[200px] max-w-[200px] shrink-0";

/** Truncated node label with native browser tooltip on hover. */
export const FuseNodeLabel = ({ label, className = "" }) => (
  <span title={label || undefined} className={`block truncate ${className}`}>
    {label}
  </span>
);

/** Truncated node id line with tooltip on hover. */
export const FuseNodeIdLabel = ({ id, className = "" }) => {
  const text = `NODE ${getDisplayFuseNodeId(id)}`;
  return (
    <span title={text} className={`block truncate select-all ${className}`}>
      {text}
    </span>
  );
};
