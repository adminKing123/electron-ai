import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useFuseStudioStore from "../../store/useFuseStudioStore";
import useIsDark from "../../hooks/useIsDark";
import { getNodeIcon } from "./iconRegistry";
import { BasicLoader } from "../Loaders";

// ─── FuseFlowNode ─────────────────────────────────────────────────────────────
// Custom React Flow node rendered for every node in the Fuse canvas.
// All visual data comes from node.data — nothing is hardcoded here.
const FuseFlowNode = ({ id, data, selected }) => {
  const Icon = getNodeIcon(data.icon);

  // ── If / Else node — distinct yellow card with True / False footer ──────────
  if (data.nodeType === "if_else") {
    const borderCls = selected
      ? "border-[#f59e0b] shadow-[0_0_0_3px_rgba(245,158,11,0.18)]"
      : "border-[#fcd34d] dark:border-[#6b4c00] shadow-sm hover:border-[#f59e0b] dark:hover:border-[#b07800]";

    return (
      <div
        className={[
          "flex flex-col rounded-lg select-none cursor-pointer transition-colors",
          "bg-[#fffbeb] dark:bg-[#1c1800]",
          "border-2 min-w-[210px]",
          borderCls,
        ].join(" ")}
      >
        {/* Incoming handle */}
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !border-2 !border-[#fcd34d] dark:!border-[#6b4c00] !bg-[#fffbeb] dark:!bg-[#1c1800]"
        />

        {/* Header: icon + label */}
        <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2.5">
          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
            bg-[#fef3c7] dark:bg-[#2a2000]">
            {Icon
              ? <Icon className="w-[16px] h-[16px] text-[#d97706] dark:text-[#f59e0b]" />
              : <span className="w-3 h-3 rounded-sm bg-[#fcd34d]" />
            }
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-mono leading-tight text-[#d4a535] dark:text-[#5c3d00] truncate select-all">
              {id}
            </span>
            <span className="text-[13px] font-semibold leading-tight text-[#92400e] dark:text-[#fbbf24] truncate">
              {data.label}
            </span>
          </div>
        </div>

        {/* True / False branch footer */}
        <div className="flex border-t border-[#fde68a] dark:border-[#2e2000]">
          {/* True cell */}
          <div className="relative flex-1 flex items-center justify-center gap-1.5 py-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] dark:bg-[#16a34a] flex-shrink-0" />
            <span className="text-[11px] font-semibold text-[#16a34a] dark:text-[#4ade80]">True</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id="true"
              style={{ left: "50%", bottom: 0 }}
              className="!w-3 !h-3 !border-2 !border-[#22c55e] dark:!border-[#16a34a] !bg-white dark:!bg-[#1c1800]"
            />
          </div>

          {/* Divider */}
          <div className="w-px bg-[#fde68a] dark:bg-[#2e2000]" />

          {/* False cell */}
          <div className="relative flex-1 flex items-center justify-center gap-1.5 py-2">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] dark:bg-[#dc2626] flex-shrink-0" />
            <span className="text-[11px] font-semibold text-[#dc2626] dark:text-[#f87171]">False</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id="false"
              style={{ left: "50%", bottom: 0 }}
              className="!w-3 !h-3 !border-2 !border-[#ef4444] dark:!border-[#dc2626] !bg-white dark:!bg-[#1c1800]"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Default node card ───────────────────────────────────────────────────────
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
        <span className="text-[9px] font-mono leading-tight text-[#d0d0d0] dark:text-[#333] truncate select-all">
          {id}
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

// ─── Connection limits ────────────────────────────────────────────────────────
/**
 * Maximum number of outgoing edges allowed per node type.
 *
 * Any type NOT listed here defaults to 1 (single linear connection).
 * To enable multi-branch behaviour for a future node (e.g. "if_else"),
 * simply add an entry — no other code needs to change.
 *
 * Examples:
 *   if_else: 2   → exactly two outgoing branches (true / false)
 *   fork:    Infinity  → unlimited outgoing edges
 */
const NODE_OUTGOING_LIMIT = {
  if_else: 2, // true + false branch, one edge each
};

/** Returns the maximum outgoing edges allowed for the given node type. */
const getOutgoingLimit = (nodeType) =>
  NODE_OUTGOING_LIMIT[nodeType] ?? 1;

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
  const addFlowNode   = useFuseStudioStore((s) => s.addFlowNode);
  const setAddingNode = useFuseStudioStore((s) => s.setAddingNode);
  const loading       = useFuseStudioStore((s) => s.loading);
  const isDark        = useIsDark();

  // Capture the ReactFlow instance on mount so we can call screenToFlowPosition
  // inside the drop handler (must be used outside the ReactFlow component tree).
  const [rfInstance, setRfInstance] = useState(null);

  const handleNodeClick = useCallback((_evt, node) => selectNode(node), [selectNode]);
  const handlePaneClick = useCallback(() => clearSelected(), [clearSelected]);

  /**
   * Visual guard called by React Flow while the user drags a new connection.
   * Checks the outgoing-edge limit for the source node type before the mouse
   * is released — gives instant visual feedback (handle turns red/grey).
   *
   * The store’s onConnect mirrors this check for defence-in-depth.
   */
  const isValidConnection = useCallback(
    (connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const limit      = getOutgoingLimit(sourceNode?.data?.nodeType);
      const current    = edges.filter((e) => e.source === connection.source).length;
      if (current >= limit) return false;
      // For multi-handle nodes, also block reusing the same handle.
      if (connection.sourceHandle) {
        const handleUsed = edges.some(
          (e) => e.source === connection.source && e.sourceHandle === connection.sourceHandle
        );
        if (handleUsed) return false;
      }
      return true;
    },
    [nodes, edges]
  );

  /**
   * Called when the user drops a dragged action node card onto the canvas.
   * Reads the serialized node definition from dataTransfer, computes the canvas
   * position from screen coordinates, and adds the node to the store.
   */
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();

      const raw = e.dataTransfer.getData("application/fuse-node");
      if (!raw) return;

      let nodeDef;
      try { nodeDef = JSON.parse(raw); } catch { return; }

      // Use the RF instance to convert screen coords → canvas coords when the
      // graph is mounted.  Fall back to a sensible default for the empty-state
      // drop zone (ReactFlow not yet rendered, so rfInstance is null).
      const position = rfInstance
        ? rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY })
        : { x: 250, y: 100 };

      const flowNode = {
        id:       `node_${Date.now()}`,
        type:     "fuse_node",
        position,
        data: {
          nodeType:  nodeDef.type,
          label:     nodeDef.label,
          icon:      nodeDef.icon ?? null,
          config:    {},
          // StarterNodeCard tags the payload with isStarter:true;
          // ActionNodeCard payloads have no such flag.
          isStarter: nodeDef.isStarter === true,
        },
      };

      addFlowNode(flowNode);
      selectNode(flowNode);
      setAddingNode(false);
    },
    [rfInstance, addFlowNode, selectNode, setAddingNode]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // ── React Flow canvas ───────────────────────────────────────────────────
  // The drop-zone wrapper always covers the full area so starter nodes can be
  // dragged onto the empty-state canvas before ReactFlow is mounted.
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full text-[#c0c0c0] dark:text-[#3a3a3a]">
          <BasicLoader />
        </div>
      ) : nodes.length === 0 ? (
        // ── Empty state ───────────────────────────────────────────────────
        // Rendered when no nodes have been placed yet.
        // Drag-and-drop from the starter panel still works here.
        <div className="flex items-center justify-center h-full select-none">
          <div className="text-center">
            <p className="text-[14px] font-medium text-[#888] dark:text-[#555]">
              Pick a starter node
            </p>
            <p className="text-[12px] text-[#c0c0c0] dark:text-[#404040] mt-1">
              Click or drag a node from the right panel to begin
            </p>
          </div>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={setRfInstance}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          isValidConnection={isValidConnection}
          edgesReconnectable={false}
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
      </ReactFlow>
      )}
    </div>
  );
};

export default WorkflowCanvas;


