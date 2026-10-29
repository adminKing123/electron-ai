import React, { useState, useMemo } from "react";
import { BaseEdge, EdgeLabelRenderer } from "@xyflow/react";
import { TbX } from "react-icons/tb";
import useFuseStudioStore from "../../../store/useFuseStudioStore";
import useIsDark from "../../../hooks/useIsDark";
import { useFuseCanvasReadOnly } from "../fuseCanvasContext";
import {
  buildFuseEdgePath,
  fuseEdgeHaloColor,
  fuseEdgeMarker,
  resolveFuseEdgeStroke,
} from "./fuseEdgeTheme";

export default function RemovableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected = false,
}) {
  const isDark = useIsDark();
  const canvasReadOnly = useFuseCanvasReadOnly();
  const [hovered, setHovered] = useState(false);
  const removeEdge = useFuseStudioStore((s) => s.removeEdge);

  const [edgePath, labelX, labelY] = buildFuseEdgePath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const stroke = useMemo(
    () => resolveFuseEdgeStroke(isDark, { selected, hovered }),
    [isDark, selected, hovered]
  );
  const halo = fuseEdgeHaloColor(isDark);
  const markerEnd = fuseEdgeMarker(stroke);
  const showRemove = !canvasReadOnly && (hovered || selected);

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Halo — keeps edges readable on the dotted canvas */}
      <BaseEdge
        id={`${id}-halo`}
        path={edgePath}
        style={{
          stroke: halo,
          strokeWidth: 5,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          pointerEvents: "none",
        }}
        interactionWidth={0}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        interactionWidth={22}
        style={{
          stroke,
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          transition: "stroke 150ms ease",
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: showRemove ? "all" : "none",
          }}
          className={`nodrag nopan transition-opacity duration-150 ${
            showRemove ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            className="w-[22px] h-[22px] flex items-center justify-center rounded-full
              bg-white dark:bg-void-775
              border border-ink-200 dark:border-void-725
              text-ink-600 dark:text-ink-450
              hover:text-[#d93025] hover:border-[#d93025]
              dark:hover:text-[#f28b82] dark:hover:border-[#f28b82]
              hover:bg-[#fce8e6] dark:hover:bg-[#3c1917]
              shadow-[0_1px_2px_rgba(60,64,67,0.15)] dark:shadow-none
              transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              removeEdge(id);
            }}
            title="Remove connection"
          >
            <TbX className="w-3.5 h-3.5" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </g>
  );
}
