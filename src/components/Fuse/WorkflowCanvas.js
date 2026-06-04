import React, { useCallback, useState } from "react";
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
const FuseFlowNode = ({ id, data, selected }) => {
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
  // if_else: 2,  // reserved for future use
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
      return current < limit;
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
      {nodes.length === 0 ? (
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
        <MiniMap
          nodeColor={isDark ? "#252540" : "#eef0fb"}
          maskColor={isDark ? "rgba(26,26,26,0.7)" : "rgba(247,247,247,0.7)"}
          className="!border !border-[#e5e5e5] dark:!border-[#2a2a2a] !rounded-xl !overflow-hidden !shadow-none"
          zoomable
          pannable
        />
      </ReactFlow>
      )}
    </div>
  );
};

export default WorkflowCanvas;


