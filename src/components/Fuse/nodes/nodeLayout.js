import React from "react";
import { getDisplayFuseNodeId } from "../../../utils/helpers";
import { FUSE_NODE_ICON_WELL, FUSE_NODE_LABEL, FUSE_NODE_ROW_WIDTH } from "../fuseNodeTheme";

/** Canvas width — same as one picker panel column (see fuseNodeTheme). */
export const FUSE_ACTION_NODE_WIDTH = FUSE_NODE_ROW_WIDTH;
export const FUSE_IF_ELSE_NODE_WIDTH = FUSE_NODE_ROW_WIDTH;
export const FUSE_FOR_EACH_NODE_WIDTH = FUSE_NODE_ROW_WIDTH;

/** Shared typography for horizontal action nodes on the canvas. */
export const FUSE_CANVAS_LABEL_CLASS =
  "text-[14px] font-semibold leading-snug tracking-tight";
export const FUSE_CANVAS_ID_CLASS =
  "text-[10px] font-mono leading-tight uppercase tracking-wide";

/** Outer shell padding / shape for row-style canvas nodes. */
export const FUSE_CANVAS_ROW_SHELL =
  "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all duration-150 select-none cursor-pointer";

/** Icon well for circular starter triggers on the canvas. */
export const FUSE_STARTER_ICON_WELL =
  `flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${FUSE_NODE_ICON_WELL}`;

export const FUSE_STARTER_LABEL_CLASS =
  `text-[14px] font-semibold leading-snug tracking-tight text-center ${FUSE_NODE_LABEL}`;

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
