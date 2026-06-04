import React, { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useFuseStudioStore from "../../store/useFuseStudioStore";
import useIsDark from "../../hooks/useIsDark";
import { getNodeIcon } from "./iconRegistry";

// ─── FuseFlowNode ─────────────────────────────────────────────────────────────
// Custom React Flow node rendered for every node in the Fuse canvas.
// All visual data comes from node.data — nothing is hardcoded here.
const FuseFlowNode = ({ data, selected }) => {
  const Icon = getNodeIcon(data.icon);
  return (
    <div
      className={[
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl",
        "bg-white dark:bg-[#1c1c1c]",
        "border-2 transition-colors select-none",
        "min-w-[190px] max-w-[260px] cursor-pointer",
        selected
          ? "border-[#4a6cf7] dark:border-[#6b8aff] shadow-[0_0_0_3px_rgba(74,108,247,0.15)]"
          : "border-[#e0e0e0] dark:border-[#2a2a2a] shadow-sm hover:border-[#b0bef0] dark:hover:border-[#363660]",
      ].join(" ")}
    >
      {/*
       * Target (input) handle — hidden on starter nodes.
       * Nothing connects INTO a workflow trigger.
       */}
      {!data.isStarter && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !border-2 !border-[#c0c8f0] dark:!border-[#363660] !bg-white dark:!bg-[#1c1c1c]"
        />
      )}

      {/* Icon */}
      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#eef0fb] dark:bg-[#252540]">
        {Icon
          ? <Icon className="w-[16px] h-[16px] text-[#4a6cf7] dark:text-[#6b8aff]" />
          : <span className="w-3 h-3 rounded-full bg-[#c0c8e8] dark:bg-[#444]" />
        }
      </span>

      {/* Label block */}
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#aaa] dark:text-[#555]">
          {data.nodeType}
        </span>
        <span className="text-[13px] font-semibold leading-tight text-[#111] dark:text-[#e8e8e8] truncate">
          {data.label}
        </span>
      </div>

      {/* Source handle — bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[#c0c8f0] dark:!border-[#363660] !bg-white dark:!bg-[#1c1c1c]"
      />
    </div>
  );
};

/** Map of all custom node types registered with React Flow. */
const NODE_TYPES = { fuse_node: FuseFlowNode };

// ─── WorkflowCanvas ───────────────────────────────────────────────────────────
/**
 * React Flow canvas for the Fuse workflow builder.
 *
 * Reads nodes / edges and all change-handlers directly from the Zustand store —
 * no props needed for graph state.  Only `className` is passed in from the page
 * for layout positioning.
 */
const WorkflowCanvas = ({ className = "" }) => {
  const nodes         = useFuseStudioStore((s) => s.nodes);
  const edges         = useFuseStudioStore((s) => s.edges);
  const onNodesChange = useFuseStudioStore((s) => s.onNodesChange);
  const onEdgesChange = useFuseStudioStore((s) => s.onEdgesChange);
  const onConnect     = useFuseStudioStore((s) => s.onConnect);
  const selectNode    = useFuseStudioStore((s) => s.selectNode);
  const clearSelected = useFuseStudioStore((s) => s.clearSelectedNode);
  const isDark        = useIsDark();

  const handleNodeClick = useCallback((_evt, node) => selectNode(node), [selectNode]);
  const handlePaneClick = useCallback(() => clearSelected(), [clearSelected]);

  /**
   * Visual guard: prevents the user from dragging more than one edge out
   * of a starter node's source handle before they even release the mouse.
   * The store's onConnect performs the same check for defence-in-depth.
   */
  const isValidConnection = useCallback(
    (connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      if (sourceNode?.data?.isStarter) {
        return !edges.some((e) => e.source === connection.source);
      }
      return true;
    },
    [nodes, edges]
  );

  // ── Empty state ─────────────────────────────────────────────────────────
  if (nodes.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center select-none">
          <p className="text-[14px] font-medium text-[#888] dark:text-[#555]">
            Pick a starter node
          </p>
          <p className="text-[12px] text-[#c0c0c0] dark:text-[#404040] mt-1">
            Choose a node from the right panel to begin your workflow
          </p>
        </div>
      </div>
    );
  }

  // ── React Flow canvas ───────────────────────────────────────────────────
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        isValidConnection={isValidConnection}
        nodeTypes={NODE_TYPES}
        colorMode={isDark ? "dark" : "light"}
        fitView
        fitViewOptions={{ padding: 0.35, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: "#c0c8f0" },
          animated: true,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color={isDark ? "#2a2a2a" : "#e0e0e0"}
        />
        <Controls
          showInteractive={false}
          className="!shadow-none !border !border-[#e5e5e5] dark:!border-[#2a2a2a] !rounded-xl !overflow-hidden"
        />
        <MiniMap
          nodeColor={isDark ? "#252540" : "#eef0fb"}
          maskColor={isDark ? "rgba(26,26,26,0.7)" : "rgba(247,247,247,0.7)"}
          className="!border !border-[#e5e5e5] dark:!border-[#2a2a2a] !rounded-xl !overflow-hidden !shadow-none"
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;


