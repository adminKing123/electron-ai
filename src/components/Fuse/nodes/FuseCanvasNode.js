import React from "react";
import { Position } from "@xyflow/react";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "../FuseNodeIcon";
import FuseNodeHandle from "./FuseNodeHandle";
import FuseCanvasRunCornerIndicator from "./FuseCanvasRunCornerIndicator";
import {
  FUSE_CANVAS_LABEL_CLASS,
  fuseCanvasNodeBoxClass,
} from "../fuseNodeTheme";

/** n8n DEFAULT_NODE_SIZE = GRID_SIZE * 6 (96px). */
export const FUSE_CANVAS_NODE_BOX_PX = 96;
export const FUSE_CANVAS_LABEL_MAX_W = 192;

/**
 * Icon tile + caption below — matches n8n CanvasNodeDefault layout.
 * Handles: main input left, main output right (unless overridden).
 */
export const FuseCanvasNodeBox = ({
  iconName,
  selected,
  runStatus,
  isStarter,
  hideTarget,
  hideSource,
  sourceId,
  children,
  className = "",
}) => (
  <div
    className={[
      "relative flex items-center justify-center flex-shrink-0",
      fuseCanvasNodeBoxClass(selected, runStatus, isStarter),
      className,
    ].join(" ")}
  >
    {!hideTarget && !isStarter && (
      <FuseNodeHandle
        type="target"
        position={Position.Left}
        style={{ top: "50%" }}
      />
    )}
    {!hideSource && (
      <FuseNodeHandle
        type="source"
        position={Position.Right}
        id={sourceId}
        style={{ top: "50%" }}
      />
    )}
    {(runStatus === "running" || runStatus === "error") && (
      <FuseCanvasRunCornerIndicator runStatus={runStatus} />
    )}
    <FuseNodeIcon
      iconName={iconName}
      sizeClass={FUSE_NODE_ICON_SIZES.canvasLg}
    />
    {children}
  </div>
);

/** @param {"above" | "below"} placement — caption relative to the icon tile */
export const FuseCanvasNodeLabel = ({
  label,
  subtitle,
  className = "",
  placement = "below",
}) => (
  <div
    className={[
      "flex flex-col items-center gap-0.5 pointer-events-none select-none",
      placement === "above" ? "mb-1.5" : "mt-1.5",
      className,
    ].join(" ")}
    style={{ maxWidth: FUSE_CANVAS_LABEL_MAX_W }}
  >
    <span
      title={label || undefined}
      className={`${FUSE_CANVAS_LABEL_CLASS} text-ink-875 dark:text-ink-100 text-center line-clamp-2`}
    >
      {label}
    </span>
    {subtitle ? (
      <span className="text-[11px] leading-tight text-ink-500 dark:text-ink-550 text-center truncate w-full">
        {subtitle}
      </span>
    ) : null}
  </div>
);

const FuseCanvasNode = ({
  data,
  selected,
  hideTarget,
  hideSource,
  sourceId,
  subtitle,
  footer,
  children,
}) => (
  <div className="relative flex flex-col items-center select-none cursor-pointer">
    <FuseCanvasNodeBox
      iconName={data?.icon}
      selected={selected}
      runStatus={data?.runStatus}
      isStarter={data?.isStarter}
      hideTarget={hideTarget}
      hideSource={hideSource}
      sourceId={sourceId}
    />
    <FuseCanvasNodeLabel label={data?.label} subtitle={subtitle} />
    {footer}
    {children}
  </div>
);

export default FuseCanvasNode;
