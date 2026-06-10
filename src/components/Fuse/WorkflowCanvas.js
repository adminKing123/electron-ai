import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useFuseStudioStore from "../../store/useFuseStudioStore";
import useIsDark from "../../hooks/useIsDark";
import { BasicLoader } from "../Loaders";
import { NODE_TYPES } from "./nodes/FuseFlowNode";
import { getOutgoingLimit } from "./nodes/connectionLimits";

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
      // ── Outgoing limit ───────────────────────────────────────────────────────
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

      // ── Incoming limit ───────────────────────────────────────────────────────
      // Every node accepts at most ONE incoming edge.
      // Exception: if/else true/false handles are exempt so that both branches
      // can converge back onto the same downstream node.
      const isIfElseHandle =
        connection.sourceHandle === "true" || connection.sourceHandle === "false";
      if (!isIfElseHandle) {
        const incomingCount = edges.filter((e) => e.target === connection.target).length;
        if (incomingCount >= 1) return false;
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


