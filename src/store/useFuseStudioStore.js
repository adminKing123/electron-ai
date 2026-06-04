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
  // if_else: 2,  // reserved for future use
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

  // --- Graph load (called once on API response) ---
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  // --- React Flow live-change handlers ---
  /** Wire directly to ReactFlow onNodesChange. Handles drag, select, remove. */
  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  /** Wire directly to ReactFlow onEdgesChange. */
  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

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
      // Reject if the source node has reached its outgoing-edge limit.
      if (current >= limit) return {};
      return {
        edges: addEdge({ ...connection, id: `edge_${Date.now()}` }, state.edges),
      };
    }),

  // --- Graph mutation helpers ---
  /** Append a fully-formed React Flow node to the canvas. */
  addFlowNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),

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
      return { nodes, selectedNode };
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
    })),

  // --- Selection ---
  // Selecting a node always closes the "Add Node" picker.
  selectNode:       (node) => set({ selectedNode: node, addingNode: false }),
  clearSelectedNode: ()    => set({ selectedNode: null }),

  // --- Cleanup ---
  /** Called on page unmount. Clears workflow + canvas. Preserves starterNodes. */
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
      // Action nodes are cheap to re-fetch and may change during development;
      // clear them so the next page entry always gets fresh definitions.
      actionNodes: [],
      loadingActionNodes: false,
    }),
}));

export default useFuseStudioStore;