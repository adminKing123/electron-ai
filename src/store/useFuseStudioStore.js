import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";

// ─── Connection limits ─────────────────────────────────────────────────────────
/**
 * Maximum outgoing edges per node type. Defaults to 1 for any type not listed.
 * To unlock multiple branches for a future node type (e.g. "if_else"),
 * add an entry here — no other code needs to change.
 *
 *   if_else: 2   → true / false branches
 *   fork:    Infinity  → unlimited
 */
const NODE_OUTGOING_LIMIT = {
  if_else: 2, // true + false branch, one edge each
};

const getOutgoingLimit = (nodeType) => NODE_OUTGOING_LIMIT[nodeType] ?? 1;

/**
 * Zustand store for the Fuse Studio (workflow builder) page.
 *
 * Graph state (nodes / edges) is kept at the top level so React Flow change
 * handlers can update it without touching the workflow metadata object.
 *
 * React Flow node shape:
 *   {
 *     id:       string,
 *     type:     "fuse_node",
 *     position: { x: number, y: number },
 *     data: {
 *       nodeType: string,   // e.g. "schedule"
 *       label:    string,
 *       icon:     string,   // icon registry key, e.g. "TbCalendarTime"
 *       config:   object,   // FormBuilder values
 *     }
 *   }
 */
const useFuseStudioStore = create((set) => ({
  // --- Workflow metadata ---
  workflow: null,
  workflowName: "",
  loading: false,
  saving: false,

  // --- Starter node type definitions (from API, cached) ---
  starterNodes: [],
  loadingNodes: false,

  // --- Action node type definitions (from API, cached) ---
  actionNodes: [],
  loadingActionNodes: false,

  // --- Panel mode ---
  // true while the "Add Node" picker is open in the config panel.
  addingNode: false,

  // --- React Flow graph ---
  nodes: [],
  edges: [],

  // --- Selection ---
  selectedNode: null,

  // --- Compilation / execution state ---
  /** ISO-8601 timestamp of the last successful compilation, or null if never activated. */
  compiledAt: null,
  /** Validation errors from the most recent failed activation attempt. Cleared on success. */
  compilationErrors: [],
  /** True while an activate or deactivate API call is in-flight. */
  activating: false,
  /** True specifically while a deactivate call is in-flight (shows "Stopping…" vs "Compiling…"). */
  deactivating: false,
  /**
   * True when the live graph (nodes/edges) differs structurally from what was
   * last compiled.  Reset to false after every successful activation.
   * Set to true on any structural graph change while the workflow is active.
   */
  isGraphDirty: false,

  // --- Metadata actions ---
  setWorkflow:     (workflow) => set({ workflow }),
  setWorkflowName: (name)     => set({ workflowName: name }),
  setLoading:      (v)        => set({ loading: v }),
  setSaving:       (v)        => set({ saving: v }),
  setStarterNodes: (nodes)    => set({ starterNodes: nodes }),
  setLoadingNodes: (v)        => set({ loadingNodes: v }),
  setActionNodes: (nodes)     => set({ actionNodes: nodes }),
  setLoadingActionNodes: (v)  => set({ loadingActionNodes: v }),
  setAddingNode: (v)          => set({ addingNode: v }),

  // --- Compilation / execution state actions ---
  /** Call after a successful activation.  Clears errors and dirty flag. */
  setActivationSuccess: ({ compiledAt }) =>
    set({ compiledAt, compilationErrors: [], activating: false, isGraphDirty: false }),
  /** Call when activation fails with validation errors. */
  setCompilationErrors: (errors) =>
    set({ compilationErrors: errors, activating: false }),
  /** Mark in-flight activation/deactivation. */
  setActivating:   (v) => set({ activating: v }),
  setDeactivating: (v) => set({ deactivating: v }),
  /**
   * Initialise compilation state from the workflow document loaded from the API.
   * Called once on page load so the UI reflects any prior activation state.
   */
  initCompilationState: ({ compiledAt }) =>
    set({
      compiledAt,
      compilationErrors: [],
      // Always start clean — dirty is only set by explicit edits in this session.
      isGraphDirty: false,
    }),
  /** Clear compilation state (e.g. after deactivation). */
  clearCompilation: () =>
    set({ compiledAt: null, compilationErrors: [], isGraphDirty: false, activating: false, deactivating: false }),

  // --- Graph load (called once on API response) ---
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  // --- React Flow live-change handlers ---
  /** Wire directly to ReactFlow onNodesChange. Handles drag, select, remove. */
  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  /** Wire directly to ReactFlow onEdgesChange. */
  onEdgesChange: (changes) =>
    set((state) => {
      const hasStructural = changes.some((c) => c.type === "remove" || c.type === "add");
      return {
        edges: applyEdgeChanges(changes, state.edges),
        isGraphDirty:
          state.isGraphDirty ||
          (hasStructural && state.compiledAt !== null && !state.loading),
      };
    }),

  /**
   * Wire directly to ReactFlow onConnect.
   * Creates an edge on handle connection, enforcing that a starter node
   * (data.isStarter === true) may only emit ONE outgoing edge.
   */
  onConnect: (connection) =>
    set((state) => {
      const sourceNode = state.nodes.find((n) => n.id === connection.source);
      const limit      = getOutgoingLimit(sourceNode?.data?.nodeType);
      const current    = state.edges.filter((e) => e.source === connection.source).length;
      // Reject if the source node has reached its total outgoing-edge limit.
      if (current >= limit) return {};
      // For multi-handle nodes (e.g. if_else), also enforce one edge per handle.
      if (connection.sourceHandle) {
        const handleUsed = state.edges.some(
          (e) => e.source === connection.source && e.sourceHandle === connection.sourceHandle
        );
        if (handleUsed) return {};
      }
      return {
        edges: addEdge(
          { ...connection, id: `edge_${Date.now()}` },
          state.edges
        ),
        isGraphDirty: state.compiledAt !== null,
      };
    }),

  // --- Graph mutation helpers ---
  /** Append a fully-formed React Flow node to the canvas. */
  addFlowNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
      isGraphDirty: state.compiledAt !== null,
    })),

  /**
   * Update the config values stored inside a node's data.
   * Also syncs selectedNode so the config panel stays reactive.
   */
  updateNodeConfig: (nodeId, config) =>
    set((state) => {
      const nodes = state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, config } } : n
      );
      const selectedNode =
        state.selectedNode?.id === nodeId
          ? { ...state.selectedNode, data: { ...state.selectedNode.data, config } }
          : state.selectedNode;
      return { nodes, selectedNode, isGraphDirty: state.compiledAt !== null };
    }),

  /**
   * Remove a node and all edges connected to it.
   * Also clears selectedNode if it was the removed node.
   */
  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNode:
        state.selectedNode?.id === nodeId ? null : state.selectedNode,
      isGraphDirty: state.compiledAt !== null,
    })),

  // --- Selection ---
  // Selecting a node always closes the "Add Node" picker.
  selectNode:       (node) => set({ selectedNode: node, addingNode: false }),
  clearSelectedNode: ()    => set({ selectedNode: null }),

  // --- Cleanup ---
  /** Called on page unmount. Clears all workflow + canvas + node definition state. */
  resetStudio: () =>
    set({
      workflow: null,
      workflowName: "",
      loading: false,
      saving: false,
      nodes: [],
      edges: [],
      selectedNode: null,
      addingNode: false,
      starterNodes: [],
      loadingNodes: false,
      actionNodes: [],
      loadingActionNodes: false,
      // Compilation state
      compiledAt: null,
      compilationErrors: [],
      activating: false,
      deactivating: false,
      isGraphDirty: false,
    }),
}));

export default useFuseStudioStore;