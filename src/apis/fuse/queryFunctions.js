/**
 * Fuse Workflows — API query functions.
 *
 * All functions call the real backend via the shared `api()` axios wrapper,
 * which automatically attaches the Firebase auth token on every request.
 */
import api from "../index";
import ENDPOINTS from "../endpoints";

// ─── Workflows ────────────────────────────────────────────────────────────────

/** GET /fuse/workflows — returns all workflows for the current user. */
export const getWorkflowsAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_WORKFLOWS });
  return res.data;
};

/**
 * POST /fuse/workflows — creates a new workflow.
 * @param {{ name: string }} data
 */
export const createWorkflowAPI = async (data) => {
  const res = await api({ method: "POST", url: ENDPOINTS.FUSE_WORKFLOWS, data });
  return res.data;
};

/**
 * DELETE /fuse/workflows/:id — removes a workflow by ID.
 * @param {string} id
 */
export const deleteWorkflowAPI = async (id) => {
  const res = await api({ method: "DELETE", url: ENDPOINTS.FUSE_WORKFLOW(id) });
  return res.data;
};

/**
 * GET /fuse/workflows/:id — fetches a single workflow by ID.
 * @param {string} id
 */
export const getWorkflowByIdAPI = async (id) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_WORKFLOW(id) });
  return res.data;
};

/**
 * PATCH /fuse/workflows/:id/name — updates the workflow name.
 * @param {string} id
 * @param {string} name
 */
export const updateWorkflowNameAPI = async (id, name) => {
  const res = await api({ method: "PATCH", url: ENDPOINTS.FUSE_WORKFLOW_NAME(id), data: { name } });
  return res.data;
};

/**
 * PATCH /fuse/workflows/:id/graph — persists the React Flow node/edge graph.
 * @param {string} id
 * @param {Array}  nodes  React Flow node array
 * @param {Array}  edges  React Flow edge array
 */
export const updateWorkflowGraphAPI = async (id, nodes, edges) => {
  const res = await api({ method: "PATCH", url: ENDPOINTS.FUSE_WORKFLOW_GRAPH(id), data: { nodes, edges } });
  return res.data;
};

/**
 * PATCH /fuse/workflows/:id/status — toggle active / inactive.
 * @param {string} id
 * @param {"active"|"inactive"} status
 */
export const updateWorkflowStatusAPI = async (id, status) => {
  const res = await api({ method: "PATCH", url: ENDPOINTS.FUSE_WORKFLOW_STATUS(id), data: { status } });
  return res.data;
};

// ─── Node definitions ─────────────────────────────────────────────────────────

/**
 * GET /fuse/nodes/starter — returns all available starter node definitions.
 */
export const getStarterNodesAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_NODES_STARTER });
  return res.data;
};

/**
 * GET /fuse/nodes/actions — returns all available action node definitions.
 */
export const getActionNodesAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_NODES_ACTIONS });
  return res.data;
};