import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getNodeIcon } from "../iconRegistry";
import { FUSE_STARTER_NODE_SIZE, FuseNodeLabel } from "./nodeLayout";

// ─── GithubPullRequestNode ──────────────────────────────────────────────────
const GithubPullRequestNode = ({ id, data, selected }) => {
  const Icon = getNodeIcon(data.icon);

  const borderCls = selected
    ? "border-[#111] dark:border-[#eee] shadow-[0_0_0_3px_rgba(17,17,17,0.18)]"
    : "border-[#d0d0d0] dark:border-[#333] shadow-sm hover:border-[#888] dark:hover:border-[#777]";

  return (
    <div
      className={[
        "flex items-center justify-center flex-col gap-2.5 px-3.5 py-2.5 rounded-full",
        FUSE_STARTER_NODE_SIZE,
        "bg-[#fafafa] dark:bg-[#111]",
        "border-2 transition-colors select-none",
        "cursor-pointer",
        borderCls,
      ].join(" ")}
    >
      {/* Icon */}
      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full">
        {Icon
          ? <Icon className="w-[24px] h-[24px] text-[#111] dark:text-[#eee]" />
          : <span className="w-3 h-3 rounded-full bg-[#d0d0d0] dark:bg-[#333]" />
        }
      </span>

      {/* Label block */}
      <div className="w-full min-w-0 overflow-hidden text-center">
        <FuseNodeLabel
          label={data.label}
          className="text-[13px] font-semibold leading-tight text-[#111] dark:text-[#eee]"
        />
      </div>

      {/* Source handle — bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#d0d0d0] dark:!border-[#333] !bg-[#fafafa] dark:!bg-[#111]"
      />
    </div>
  );
};

export default GithubPullRequestNode;
