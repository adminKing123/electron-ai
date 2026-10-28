import React, { useCallback, useState, useRef, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useFuseStudioStore from "../../store/useFuseStudioStore";
import useIsDark from "../../hooks/useIsDark";
import { BasicLoader } from "../Loaders";
import { NODE_TYPES } from "./nodes/FuseFlowNode";
import { getOutgoingLimit, isFuseBranchSourceHandle } from "./nodes/connectionLimits";
import { createFuseNodeId } from "../../utils/helpers";
import { FUSE_DEFAULT_RUN_LOG_SAVE } from "../../utils/fuseNodeConfig";
import CanvasContextMenu from "./CanvasContextMenu";
import RemovableEdge from "./edges/RemovableEdge";
import { FUSE_EDGE_PATH } from "./edges/fuseEdgeTheme";
import {
  buildNodeLookup,
  collectRunningNodeIds,
  isRunEdgeTraversed,
  nodeHasRunActivity,
  runVisualsActive,
} from "../../utils/fuseRunCanvasVisual";

const EDGE_TYPES = {
  removable: RemovableEdge,
};

// Fallback node dimensions used before React Flow measures a rendered node
const NODE_DIM = {
  starter: { w: 96, h: 128 },
  action:  { w: 96, h: 128 },
};

/** Space (flow units) added outside the tight bounding box when creating a block. */
const BLOCK_PADDING = 30;

// --- WorkflowCanvas -----------------------------------------------------------
/**
 * React Flow canvas for the Fuse workflow builder.
 *
 * Right-click on the canvas pane ? context menu ? "Draw Block":
 *   1. Canvas enters draw mode (crosshair overlay)
 *   2. User drags a selection rectangle
 *   3. On release — if =1 workflow node was enclosed — a name dialog appears
 *   4. Confirming creates a purely-visual fuse_block node behind those nodes
 *
 * Blocks are cosmetic overlays and do not affect workflow node data.
 * They are cosmetic overlays that make the workflow easier to read.
 *
 * Clicking a block node does NOT open the side NodeConfigPanel; all editing
 * (rename, colour, remove) happens in the block's own NodeToolbar popup.
 */
const WorkflowCanvas = ({
  className = "",
  readOnly = false,
  runNodeStates = null,
  activeNodeId = null,
  activeNodeIds = null,
  selectedNodeId = null,
  onRunNodeSelect = null,
}) => {
  const nodes         = useFuseStudioStore((s) => s.nodes);
  const edges         = useFuseStudioStore((s) => s.edges);
  const onNodesChange = useFuseStudioStore((s) => s.onNodesChange);
  const onEdgesChange = useFuseStudioStore((s) => s.onEdgesChange);
  const onConnect     = useFuseStudioStore((s) => s.onConnect);
  const selectNode    = useFuseStudioStore((s) => s.selectNode);
  const clearSelected = useFuseStudioStore((s) => s.clearSelectedNode);
  const addFlowNode   = useFuseStudioStore((s) => s.addFlowNode);
  const setAddingNode = useFuseStudioStore((s) => s.setAddingNode);
  const addBlock      = useFuseStudioStore((s) => s.addBlock);
  const loading       = useFuseStudioStore((s) => s.loading);
  const isDark        = useIsDark();

  const [rfInstance, setRfInstance] = useState(null);
  const containerRef = useRef(null);

  // -- Context menu ---------------------------------------------------------
  const [contextMenu, setContextMenu] = useState(null); // { x, y } screen coords

  // -- Draw mode -------------------------------------------------------------
  const [drawMode,     setDrawMode]     = useState(false);
  const [drawRect,     setDrawRect]     = useState(null);  // container-relative px
  const [pendingBlock, setPendingBlock] = useState(null);  // { childIds }
  const [blockName,    setBlockName]    = useState("");

  // Mutable ref so global listeners avoid stale closures
  const drawStateRef      = useRef({ active: false, startX: 0, startY: 0, endX: 0, endY: 0 });
  const blockNameInputRef = useRef(null);

  // -- Global mouse listeners during draw mode -------------------------------
  useEffect(() => {
    if (!drawMode) return;

    const onMouseMove = (e) => {
      if (!drawStateRef.current.active) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      drawStateRef.current.endX = e.clientX - rect.left;
      drawStateRef.current.endY = e.clientY - rect.top;
      setDrawRect({ ...drawStateRef.current });
    };

    const onMouseUp = () => {
      if (!drawStateRef.current.active) { setDrawMode(false); return; }

      const ds = { ...drawStateRef.current };
      drawStateRef.current = { active: false, startX: 0, startY: 0, endX: 0, endY: 0 };
      setDrawRect(null);
      setDrawMode(false);

      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect || !rfInstance) return;

      const minX = Math.min(ds.startX, ds.endX);
      const minY = Math.min(ds.startY, ds.endY);
      const maxX = Math.max(ds.startX, ds.endX);
      const maxY = Math.max(ds.startY, ds.endY);
      if (maxX - minX < 10 || maxY - minY < 10) return;

      // Convert container-relative corners ? flow coordinates
      const tl = rfInstance.screenToFlowPosition({ x: minX + containerRect.left, y: minY + containerRect.top });
      const br = rfInstance.screenToFlowPosition({ x: maxX + containerRect.left, y: maxY + containerRect.top });
      const dr = { x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y };

      // Use getState() so we never read stale nodes from the closure
      const childIds = useFuseStudioStore.getState().nodes
        .filter((n) => n.type !== "fuse_block")         // skip existing blocks
        .filter((n) => {
          const nw = n.measured?.width  ?? (n.data?.isStarter ? NODE_DIM.starter.w : NODE_DIM.action.w);
          const nh = n.measured?.height ?? (n.data?.isStarter ? NODE_DIM.starter.h : NODE_DIM.action.h);
          const cx = n.position.x + nw / 2;
          const cy = n.position.y + nh / 2;
          return cx >= dr.x && cx <= dr.x + dr.w && cy >= dr.y && cy <= dr.y + dr.h;
        })
        .map((n) => n.id);

      if (childIds.length > 0) {
        setPendingBlock({ childIds });
        setBlockName("Block");
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, [drawMode, rfInstance]);

  // Escape key cancels draw mode or the name dialog
  useEffect(() => {
    if (!drawMode && !pendingBlock) return;
    const onEsc = (e) => {
      if (e.key !== "Escape") return;
      setDrawMode(false);
      setDrawRect(null);
      setPendingBlock(null);
      setBlockName("");
      drawStateRef.current = { active: false, startX: 0, startY: 0, endX: 0, endY: 0 };
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [drawMode, pendingBlock]);

  // Auto-focus name input when dialog appears
  useEffect(() => {
    if (pendingBlock) setTimeout(() => blockNameInputRef.current?.focus(), 50);
  }, [pendingBlock]);

  // -- Handlers -------------------------------------------------------------

  /**
   * Node click: blocks do NOT open the side panel — all editing is in the
   * block's own NodeToolbar.  Regular workflow nodes go through selectNode.
   */
  const handleNodeClick = useCallback(
    (_evt, node) => {
      if (node.type === "fuse_block") {
        if (!readOnly) clearSelected();
        return;
      }
      if (readOnly && onRunNodeSelect) {
        onRunNodeSelect(node);
        return;
      }
      selectNode(node);
    },
    [selectNode, clearSelected, readOnly, onRunNodeSelect]
  );

  const handlePaneClick = useCallback(() => {
    if (readOnly) {
      onRunNodeSelect?.(null);
      return;
    }
    clearSelected();
    setContextMenu(null);
  }, [clearSelected, readOnly, onRunNodeSelect]);

  const handlePaneContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleDrawBlockStart = useCallback(() => {
    setContextMenu(null);
    setDrawMode(true);
  }, []);

  const handleOverlayMouseDown = useCallback((e) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    drawStateRef.current = { active: true, startX: sx, startY: sy, endX: sx, endY: sy };
    setDrawRect({ startX: sx, startY: sy, endX: sx, endY: sy });
  }, []);

  /** Compute tight bounds from the enclosed nodes and create the block. */
  const handleConfirmBlock = useCallback(() => {
    if (!pendingBlock) return;

    const currentNodes = useFuseStudioStore.getState().nodes;
    const childNodes   = currentNodes.filter((n) => pendingBlock.childIds.includes(n.id));

    const minX = Math.min(...childNodes.map((n) => n.position.x));
    const minY = Math.min(...childNodes.map((n) => n.position.y));
    const maxX = Math.max(...childNodes.map((n) =>
      n.position.x + (n.measured?.width  ?? (n.data?.isStarter ? NODE_DIM.starter.w : NODE_DIM.action.w))
    ));
    const maxY = Math.max(...childNodes.map((n) =>
      n.position.y + (n.measured?.height ?? (n.data?.isStarter ? NODE_DIM.starter.h : NODE_DIM.action.h))
    ));

    addBlock({
      id:       `block_${createFuseNodeId()}`,
      position: { x: minX - BLOCK_PADDING, y: minY - BLOCK_PADDING },
      width:    (maxX - minX) + BLOCK_PADDING * 2,
      height:   (maxY - minY) + BLOCK_PADDING * 2,
      label:    blockName.trim() || "Block",
    });

    setPendingBlock(null);
    setBlockName("");
  }, [pendingBlock, blockName, addBlock]);

  const handleCancelBlock = useCallback(() => {
    setPendingBlock(null);
    setBlockName("");
  }, []);

  // -- Connection validation -------------------------------------------------
  const isValidConnection = useCallback(
    (connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const limit      = getOutgoingLimit(sourceNode?.data?.nodeType);
      const current    = edges.filter((e) => e.source === connection.source).length;
      if (current >= limit) return false;
      if (connection.sourceHandle) {
        const used = edges.some(
          (e) => e.source === connection.source && e.sourceHandle === connection.sourceHandle
        );
        if (used) return false;
      }
      const isBranchHandle = isFuseBranchSourceHandle(
        connection.sourceHandle,
        sourceNode?.data?.nodeType
      );
      const targetNode = nodes.find((n) => n.id === connection.target);
      const isJoinTarget = targetNode?.data?.nodeType === "join";

      if (!isBranchHandle && !isJoinTarget) {
        if (edges.filter((e) => e.target === connection.target).length >= 1) return false;
      }
      return true;
    },
    [nodes, edges]
  );

  // -- Drag-and-drop ---------------------------------------------------------
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/fuse-node");
      if (!raw) return;
      let nodeDef;
      try { nodeDef = JSON.parse(raw); } catch { return; }

      const position = rfInstance
        ? rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY })
        : { x: 250, y: 100 };

      const flowNode = {
        id:   `${createFuseNodeId()}`,
        type: "fuse_node",
        position,
        data: {
          nodeType:  nodeDef.type,
          label:     nodeDef.label,
          icon:      nodeDef.icon ?? null,
          config:    { ...(nodeDef.defaults || {}), ...FUSE_DEFAULT_RUN_LOG_SAVE },
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

  // -- Selection rectangle visual style ------------------------------------
  const selectionStyle = drawRect
    ? {
        left:   Math.min(drawRect.startX, drawRect.endX),
        top:    Math.min(drawRect.startY, drawRect.endY),
        width:  Math.abs(drawRect.endX - drawRect.startX),
        height: Math.abs(drawRect.endY - drawRect.startY),
      }
    : null;

  const runningNodeIds = useMemo(
    () => collectRunningNodeIds(runNodeStates, activeNodeIds),
    [runNodeStates, activeNodeIds]
  );

  const runCanvasActive = readOnly && runVisualsActive(runNodeStates, runningNodeIds);
  const nodeById = useMemo(() => buildNodeLookup(nodes), [nodes]);

  const displayNodes = useMemo(() => {
    if (!readOnly && !runNodeStates && !selectedNodeId) return nodes;
    return nodes.map((n) => {
      let next = n;
      if (n.type !== "fuse_block" && (runNodeStates || runningNodeIds.size > 0)) {
        const st = runNodeStates?.[n.id];
        const isRunning =
          runningNodeIds.has(n.id) || st?.status === "running";
        const runStatus = isRunning ? "running" : st?.status ?? undefined;
        const { runStatus: _drop, runMuted: _m, ...baseData } = n.data ?? {};
        next = {
          ...n,
          data: runStatus ? { ...baseData, runStatus } : baseData,
        };
      }
      if (runCanvasActive && n.type !== "fuse_block") {
        const ran = nodeHasRunActivity(n.id, runNodeStates, runningNodeIds);
        if (!ran) {
          next = {
            ...next,
            style: {
              ...(next.style ?? {}),
              opacity: 0.28,
              filter: "saturate(0.45)",
            },
          };
        }
      }
      if (runningNodeIds.has(n.id)) {
        next = {
          ...next,
          zIndex: 1000,
          className: "fuse-run-node-active",
          style: { ...(next.style ?? {}), opacity: 1, filter: "none" },
        };
      }
      if (selectedNodeId && n.id === selectedNodeId) {
        next = { ...next, selected: true };
      }
      return next;
    });
  }, [nodes, readOnly, runNodeStates, runningNodeIds, selectedNodeId, runCanvasActive]);

  const displayEdges = useMemo(() => {
    if (!readOnly) return edges;

    const traversedStroke = isDark ? "#94a3b8" : "#7c3aed";
    const idleStroke = isDark ? "#363636" : "#d8d4e8";

    return edges.map((edge) => {
      const traversed = runCanvasActive
        ? isRunEdgeTraversed(edge, runNodeStates, runningNodeIds, nodeById)
        : false;
      const toActive = runningNodeIds.has(edge.target);

      const pathOptions = {
        borderRadius: FUSE_EDGE_PATH.borderRadius,
        offset: FUSE_EDGE_PATH.offset,
      };

      if (traversed) {
        return {
          ...edge,
          type: "smoothstep",
          pathOptions,
          animated: toActive,
          style: {
            stroke: traversedStroke,
            strokeWidth: toActive ? 2.75 : 2.25,
            opacity: 1,
          },
        };
      }

      return {
        ...edge,
        type: "smoothstep",
        pathOptions,
        animated: false,
        style: {
          stroke: idleStroke,
          strokeWidth: 1.25,
          opacity: runCanvasActive ? 0.22 : 0.45,
        },
      };
    });
  }, [edges, readOnly, runningNodeIds, isDark, runCanvasActive, runNodeStates, nodeById]);

  // -- Render ----------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden ${className}`}
      onDrop={readOnly ? undefined : handleDrop}
      onDragOver={readOnly ? undefined : handleDragOver}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full min-h-[200px] text-ink-400 dark:text-ink-600">
          <BasicLoader />
        </div>
      ) : nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[200px] select-none">
          {readOnly ? (
            <div className="text-center px-4">
              <p className="text-[14px] font-medium text-ink-500 dark:text-ink-550">
                Workflow graph unavailable
              </p>
              <p className="text-[12px] text-ink-400 dark:text-ink-600 mt-1">
                Could not load the canvas for this run.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-[14px] font-medium text-ink-500 dark:text-ink-550">
                Pick a starter node
              </p>
              <p className="text-[12px] text-ink-400 dark:text-ink-600 mt-1">
                Click or drag a node from the right panel to begin
              </p>
            </div>
          )}
        </div>
      ) : (
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onInit={setRfInstance}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          onConnect={readOnly ? undefined : onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onPaneContextMenu={readOnly ? undefined : handlePaneContextMenu}
          isValidConnection={readOnly ? undefined : isValidConnection}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable
          edgesReconnectable={false}
          nodeTypes={NODE_TYPES}
          edgeTypes={readOnly ? undefined : EDGE_TYPES}
          colorMode={isDark ? "dark" : "light"}
          fitView
          fitViewOptions={{ padding: 0.35, maxZoom: 1 }}
          proOptions={{ hideAttribution: true }}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={{
            stroke: isDark ? "#94a3b8" : "#7c3aed",
            strokeWidth: 2,
            strokeLinecap: "round",
          }}
          defaultEdgeOptions={
            readOnly
              ? {
                  type: "smoothstep",
                  animated: false,
                  pathOptions: {
                    borderRadius: FUSE_EDGE_PATH.borderRadius,
                    offset: FUSE_EDGE_PATH.offset,
                  },
                }
              : { type: "removable", animated: false }
          }
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color={isDark ? "#3b4250" : "#e5e2f0"}
          />
          <Controls
            showInteractive={false}
            className="!shadow-none !border !border-ink-150 dark:!border-void-800 !rounded-xl !overflow-hidden !bg-white dark:!bg-void-775"
            style={
              isDark
                ? {
                    "--xy-controls-button-color-default": "#9894ae",
                    "--xy-controls-button-color-hover-default": "#ebe9f4",
                    "--xy-controls-button-background-color-default": "#333a47",
                    "--xy-controls-button-background-color-hover-default": "#3b4250",
                    "--xy-controls-button-border-color-default": "#3b4250",
                  }
                : {
                    "--xy-controls-button-color-default": "#404040",
                    "--xy-controls-button-color-hover-default": "#020202",
                    "--xy-controls-button-background-color-default": "#ffffff",
                    "--xy-controls-button-background-color-hover-default": "#f5f4fa",
                    "--xy-controls-button-border-color-default": "#e5e2f0",
                  }
            }
          />
        </ReactFlow>
      )}

      {/* -- Context menu ------------------------------------------------ */}
      {!readOnly && contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDrawBlock={handleDrawBlockStart}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* -- Draw-mode overlay ------------------------------------------- */}
      {!readOnly && drawMode && (
        <div
          className="absolute inset-0 z-10 cursor-crosshair select-none"
          onMouseDown={handleOverlayMouseDown}
        >
          {selectionStyle && (
            <div
              className="absolute pointer-events-none rounded-md
                border-2 border-brand-600 dark:border-brand-400
                bg-brand-600/10 dark:bg-brand-400/10"
              style={selectionStyle}
            />
          )}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none
              px-3 py-1.5 rounded-full shadow
              bg-white/90 dark:bg-void-825/90
              border border-ink-150 dark:border-void-800
              text-[11px] font-medium text-ink-500 dark:text-ink-600 select-none"
          >
            Drag to draw a block &nbsp;�&nbsp; <kbd className="font-mono">Esc</kbd> to cancel
          </div>
        </div>
      )}

      {/* -- Block name dialog ------------------------------------------- */}
      {!readOnly && pendingBlock && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/10 dark:bg-black/25"
            onClick={handleCancelBlock}
          />
          <div
            className="relative z-10 w-[280px]
              bg-white dark:bg-void-825
              border border-ink-150 dark:border-void-800
              rounded-2xl shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[14px] font-semibold text-ink-975 dark:text-ink-100 mb-0.5">
              Name your block
            </h3>
            <p className="text-[12px] text-ink-450 dark:text-ink-550 mb-3.5">
              {pendingBlock.childIds.length} node{pendingBlock.childIds.length !== 1 ? "s" : ""} will be grouped
            </p>
            <input
              ref={blockNameInputRef}
              type="text"
              value={blockName}
              onChange={(e) => setBlockName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")  handleConfirmBlock();
                if (e.key === "Escape") handleCancelBlock();
              }}
              placeholder="Block name..."
              maxLength={48}
              className="w-full px-3 py-2 rounded-lg mb-3
                text-[13px] font-medium
                bg-ink-50 dark:bg-void-825
                border border-ink-150 dark:border-void-750
                text-ink-975 dark:text-ink-150
                placeholder:text-ink-450 dark:placeholder:text-ink-550
                outline-none focus:border-brand-600 dark:focus:border-brand-400
                transition-colors"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelBlock}
                className="flex-1 py-1.5 rounded-lg
                  text-[12px] font-medium select-none
                  text-ink-550 dark:text-ink-600
                  border border-ink-150 dark:border-void-800
                  hover:bg-ink-50 dark:hover:bg-void-825
                  transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                className="flex-1 py-1.5 rounded-lg
                  text-[12px] font-semibold select-none
                  bg-brand-600 dark:bg-brand-500 shadow-glow
                  text-white dark:text-[var(--brand-on-solid)]
                  hover:bg-brand-700 dark:hover:bg-brand-600
                  transition-colors"
              >
                Create Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowCanvas;
