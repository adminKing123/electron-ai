import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getNodeIcon } from "../iconRegistry";
import { getDisplayFuseNodeId } from "../../../utils/helpers";

// ─── SendWebexMessageNode ───────────────────────────────────────────────────
// Canvas node for the "Send Webex Message" action.
const SendWebexMessageNode = ({ id, data, selected }) => {
  const Icon = getNodeIcon(data.icon);

  const borderCls = selected
    ? "border-[#0073b7] dark:border-[#38bdf8] shadow-[0_0_0_3px_rgba(0,115,183,0.18)]"
    : "border-[#bae6fd] dark:border-[#0c4a6e] shadow-sm hover:border-[#0284c7] dark:hover:border-[#0369a1]";

  return (
    <div
      className={[
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl",
        "bg-[#f0f9ff] dark:bg-[#0c1929]",
        "border-2 transition-colors select-none",
        "min-w-[190px] max-w-[260px] cursor-pointer",
        borderCls,
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[#bae6fd] dark:!border-[#0c4a6e] !bg-[#f0f9ff] dark:!bg-[#0c1929] !rounded-none"
      />

      <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#e0f2fe] dark:bg-[#082032]">
        {Icon
          ? <Icon className="w-[24px] h-[24px] text-[#0073b7] dark:text-[#38bdf8]" />
          : <span className="w-3 h-3 rounded-full bg-[#bae6fd] dark:bg-[#0c4a6e]" />
        }
      </span>

      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-semibold leading-tight text-[#0c4a6e] dark:text-[#7dd3fc] truncate">
          {data.label}
        </span>
        <span className="text-[9px] font-mono leading-tight text-[#0284c7] dark:text-[#38bdf8] truncate select-all">
          NODE {getDisplayFuseNodeId(id)}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#bae6fd] dark:!border-[#0c4a6e] !bg-[#f0f9ff] dark:!bg-[#0c1929]"
      />
    </div>
  );
};

export default SendWebexMessageNode;
