import React from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import { TbX } from "react-icons/tb";
import useFuseStudioStore from "../../../store/useFuseStudioStore";

export default function RemovableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const removeEdge = useFuseStudioStore((s) => s.removeEdge);

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            className="w-5 h-5 flex items-center justify-center rounded-full bg-white dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#444] text-[#888] hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-400 dark:hover:bg-red-900/20 transition-colors shadow-sm cursor-pointer z-50"
            onClick={(e) => {
              e.stopPropagation();
              removeEdge(id);
            }}
            title="Remove connection"
          >
            <TbX className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
