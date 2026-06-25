/**
 * Fuse Workflows — API query functions.
 *
 * All functions call the real backend via the shared `api()` axios wrapper,
 * which automatically attaches the Firebase auth token on every request.
 */
import api from "../index";
import ENDPOINTS from "../endpoints";

// ─── Workflows ────────────────────────────────────────────────────────────────

/** GET /fuse/workflows — returns a paginated page of workflows for the current user.
 * @param {{ limit?: number, after_created_at?: string, after_id?: string }} params
 * @returns {{ items: object[], next_cursor: object|null }}
 */
export const getWorkflowsAPI = async (params = {}) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_WORKFLOWS, params });
  return res.data; // { items, next_cursor }
};

/** GET /fuse/workflows/discover */
export const discoverWorkflowsAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_DISCOVER });
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

/**
 * GET /fuse/integration — returns all available integrations.
 */
export const getIntegrationsAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATIONS });
  return res.data;
};

/**
 * GET /fuse/integration/gmail/info — returns Gmail integration details.
 */
export const getGmailIntegrationInfoAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_GMAIL_INFO });
  return res.data;
};

/**
 * GET /fuse/integration/gmail/auth — start Gmail OAuth.
 */
export const startGmailAuthAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_GMAIL_AUTH });
  return res.data;
};

/**
 * DELETE /fuse/integration/:id — revoke integration.
 */
export const revokeIntegrationAPI = async (id) => {
  const res = await api({ method: "DELETE", url: ENDPOINTS.FUSE_INTEGRATION_REVOKE(id) });
  return res.data;
};

// ─── Execution control ────────────────────────────────────────────────────────

/**
 * POST /fuse/workflows/:id/activate
 * Compile the current graph and start execution.
 * Returns { success, workflow, compiled_at, graph_hash, webhook_url }.
 * Throws (with response.data.errors array) on validation failure.
 * @param {string} id
 */
export const activateWorkflowAPI = async (id) => {
  const res = await api({ method: "POST", url: ENDPOINTS.FUSE_WORKFLOW_ACTIVATE(id) });
  return res.data;
};

/**
 * POST /fuse/workflows/:id/deactivate
 * Stop the workflow execution and set status to inactive.
 * Returns { success, workflow }.
 * @param {string} id
 */
export const deactivateWorkflowAPI = async (id) => {
  const res = await api({ method: "POST", url: ENDPOINTS.FUSE_WORKFLOW_DEACTIVATE(id) });
  return res.data;
};

// ─── Web Push ──────────────────────────────────────────────────────────────────

/** GET /fuse/push/vapid-public-key — returns the server's VAPID public key. */
export const getVapidPublicKeyAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_PUSH_VAPID_KEY });
  return res.data.public_key;
};

/**
 * POST /fuse/push/subscribe — saves a PushSubscription for the current user.
 * @param {PushSubscription} subscription
 */
export const pushSubscribeAPI = async (subscription) => {
  const res = await api({
    method: "POST",
    url: ENDPOINTS.FUSE_PUSH_SUBSCRIBE,
    data: subscription.toJSON(),
  });
  return res.data;
};

/**
 * POST /fuse/push/unsubscribe — removes a push subscription by endpoint.
 * @param {string} endpoint
 */
export const pushUnsubscribeAPI = async (endpoint) => {
  const res = await api({
    method: "POST",
    url: ENDPOINTS.FUSE_PUSH_UNSUBSCRIBE,
    data: { endpoint },
  });
  return res.data;
};

// ─── Runs ──────────────────────────────────────────────────────────────────────

/**
 * GET /fuse/workflows/:id/runs — returns a paginated page of runs for a workflow.
 * @param {string} workflowId
 * @param {{ limit?: number, after_started_at?: string, after_run_id?: string }} params
 * @returns {{ items: object[], next_cursor: object|null }}
 */
export const getWorkflowRunsAPI = async (workflowId, params = {}) => {
  const res = await api({
    method: "GET",
    url: ENDPOINTS.FUSE_WORKFLOW_RUNS(workflowId),
    params,
  });
  return res.data; // { items, next_cursor }
};

/**
 * GET /fuse/runs/:runId — fetch a single run document.
 * @param {string} runId
 */
export const getRunAPI = async (runId) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_RUN(runId) });
  return res.data;
};

/**
 * GET /fuse/runs/:runId/logs — fetch a paginated page of node logs for a run.
 * @param {string} runId
 * @param {{ limit?: number, after_started_at?: string, after_log_id?: string }} params
 * @returns {{ items: object[], next_cursor: object|null }}
 */
export const getRunLogsAPI = async (runId, params = {}) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_RUN_LOGS(runId), params });
  return res.data; // { items, next_cursor }
};

// ─── Versions ──────────────────────────────────────────────────────────────────

/**
 * GET /fuse/workflows/:id/versions — list compiled graph versions (slim, no graph body).
 * @param {string} workflowId
 */
export const getWorkflowVersionsAPI = async (workflowId) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_WORKFLOW_VERSIONS(workflowId) });
  return res.data;
};

/**
 * GET /fuse/versions/:versionId — fetch a single version including the full compiled_graph.
 * @param {string} versionId
 */
export const getVersionAPI = async (versionId) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_VERSION(versionId) });
  return res.data;
};