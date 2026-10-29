import React from "react";
import { Position } from "@xyflow/react";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "../FuseNodeIcon";
import FuseNodeHandle from "./FuseNodeHandle";
import FuseCanvasRunCornerIndicator from "./FuseCanvasRunCornerIndicator";
import {
  FUSE_NODE_LABEL,
  FUSE_NODE_LABEL_MUTED,
  fuseCanvasNodeShellClass,
} from "../fuseNodeTheme";

export const BRANCH_CARD_WIDTH = 200;
const HEADER_H = 42;
const ROW_H = 36;

const DOT_CLASS = {
  brand: "bg-brand-600 dark:bg-brand-400",
  muted: "bg-ink-450 dark:bg-ink-550",
  success: "bg-emerald-600 dark:bg-emerald-400",
  danger: "bg-red-600 dark:bg-red-400",
};

export const branchRowHandleTop = (rowIndex) =>
  HEADER_H + rowIndex * ROW_H + ROW_H / 2;

/**
 * Shared branch UI — header (icon + title), output rows, left in / right outs.
 * @param {Array<{ id: string, label: string, dot?: keyof typeof DOT_CLASS }>} branches
 */
const FuseBranchCardNode = ({
  data,
  selected,
  branches,
  defaultTitle = "Node",
}) => {
  const runStatus = data?.runStatus;
  const title = data?.label || defaultTitle;
  const heightPx = HEADER_H + branches.length * ROW_H;

  return (
    <div className="relative flex flex-col items-center select-none cursor-pointer">
      <div
        className={[
          "relative rounded-xl overflow-visible box-border",
          fuseCanvasNodeShellClass(selected, runStatus),
          selected && runStatus !== "running"
            ? "border-brand-500/40 dark:border-brand-400/45"
            : "",
        ].join(" ")}
        style={{
          width: BRANCH_CARD_WIDTH,
          minWidth: BRANCH_CARD_WIDTH,
          height: heightPx,
          minHeight: heightPx,
        }}
      >
        <FuseNodeHandle
          type="target"
          position={Position.Left}
          style={{ top: heightPx / 2 }}
        />

        {(runStatus === "running" || runStatus === "error") && (
          <FuseCanvasRunCornerIndicator runStatus={runStatus} />
        )}

        <div
          className="flex items-center gap-2.5 px-3 border-b border-ink-200 dark:border-void-725 pointer-events-none"
          style={{ height: HEADER_H }}
        >
          <FuseNodeIcon
            iconName={data?.icon}
            sizeClass={FUSE_NODE_ICON_SIZES.canvasSm}
          />
          <span
            className={`text-[13px] font-semibold leading-tight truncate flex-1 min-w-0 ${FUSE_NODE_LABEL}`}
            title={title}
          >
            {title}
          </span>
        </div>

        {branches.map((branch, index) => {
          const isLast = index === branches.length - 1;
          const dot =
            DOT_CLASS[branch.dot ?? "brand"] ?? DOT_CLASS.brand;

          return (
            <div
              key={branch.id}
              className={[
                "flex items-center gap-2 px-3 pointer-events-none",
                !isLast ? "border-b border-ink-200 dark:border-void-725" : "",
              ].join(" ")}
              style={{ height: ROW_H }}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
              <span
                className={`text-[11px] font-semibold truncate flex-1 min-w-0 ${FUSE_NODE_LABEL_MUTED}`}
                title={branch.label}
              >
                {branch.label}
              </span>
            </div>
          );
        })}

        {branches.map((branch, index) => (
          <FuseNodeHandle
            key={branch.id}
            type="source"
            position={Position.Right}
            id={branch.id}
            style={{ top: branchRowHandleTop(index) }}
          />
        ))}
      </div>
    </div>
  );
};

export default FuseBranchCardNode;
