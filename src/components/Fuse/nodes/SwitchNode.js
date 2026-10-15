import React, { useMemo } from "react";
import { Position } from "@xyflow/react";
import FuseNodeRowContent from "../FuseNodeRowContent";
import {
  FUSE_NODE_LABEL_MUTED,
  FUSE_NODE_ROW_INNER,
  FUSE_NODE_ROW_WIDTH,
  fuseCanvasNodeShellClass,
} from "../fuseNodeTheme";
import FuseNodeHandle from "./FuseNodeHandle";

const FALLBACK_CASES = [
  { id: "case_0", label: "Case 1" },
  { id: "case_1", label: "Case 2" },
];

/** Must match row layout below (px from node top to row center). */
const SWITCH_HEADER_H = 52;
const SWITCH_ROW_H = 40;

const switchHandleTop = (rowIndex) =>
  SWITCH_HEADER_H + 1 + rowIndex * SWITCH_ROW_H + SWITCH_ROW_H / 2;

const SwitchNode = ({ data, selected }) => {
  const cases = useMemo(() => {
    const raw = data?.config?.cases;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return FALLBACK_CASES;
  }, [data?.config?.cases]);

  return (
    <div
      className={[
        FUSE_NODE_ROW_WIDTH,
        "rounded-2xl overflow-visible",
        fuseCanvasNodeShellClass(selected, data.runStatus),
      ].join(" ")}
    >
      <div className={FUSE_NODE_ROW_INNER}>
        <FuseNodeHandle
          type="target"
          position={Position.Top}
          className="!rounded-none"
        />
        <FuseNodeRowContent iconName={data.icon} label={data.label} />
      </div>

      <div className="flex flex-col border-t border-[#dadce0] dark:border-[#3c4043] overflow-visible">
        {cases.map((c, index) => (
          <div
            key={c.id ?? `case_${index}`}
            className={[
              "flex items-center gap-2 min-h-[40px] py-2 pl-3 pr-2 min-w-0",
              index > 0 ? "border-t border-[#dadce0] dark:border-[#3c4043]" : "",
            ].join(" ")}
          >
            <span className="w-2 h-2 rounded-full bg-[#1a73e8] flex-shrink-0" />
            <span
              className={`text-[10px] font-semibold truncate flex-1 ${FUSE_NODE_LABEL_MUTED}`}
              title={c.label || c.id}
            >
              {c.label || c.id}
            </span>
          </div>
        ))}

        <div
          className="flex items-center gap-2 min-h-[40px] py-2 pl-3 pr-2 min-w-0
            border-t border-[#dadce0] dark:border-[#3c4043]"
        >
          <span className="w-2 h-2 rounded-full bg-[#9aa0a6] flex-shrink-0" />
          <span className={`text-[10px] font-semibold flex-1 ${FUSE_NODE_LABEL_MUTED}`}>
            Default
          </span>
        </div>
      </div>

      {cases.map((c, index) => (
        <FuseNodeHandle
          key={c.id}
          type="source"
          position={Position.Right}
          id={c.id}
          style={{ top: switchHandleTop(index) }}
        />
      ))}
      <FuseNodeHandle
        type="source"
        position={Position.Right}
        id="default"
        style={{ top: switchHandleTop(cases.length) }}
      />
    </div>
  );
};

export default SwitchNode;
