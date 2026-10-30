/**
 * Fuse Workflows â€” API query functions.
 *
 * All functions call the real backend via the shared `api()` axios wrapper,
 * which automatically attaches the Firebase auth token on every request.
 */
import api from "../index";
import ENDPOINTS from "../endpoints";

// â"€â"€â"€ Workflows â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

/** GET /fuse/workflows â€” returns a paginated page of workflows for the current user.
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
 * POST /fuse/workflows â€” creates a new workflow.
 * @param {{ name: string }} data
 */
export const createWorkflowAPI = async (data) => {
  const res = await api({ method: "POST", url: ENDPOINTS.FUSE_WORKFLOWS, data });
  return res.data;
};

/**
 * POST /fuse/workflows/generate â€” creates a workflow from a natural-language prompt.
 * @param {{ prompt: string }} data
 */
export const generateWorkflowAPI = async (data) => {
  const res = await api({ method: "POST", url: ENDPOINTS.FUSE_WORKFLOWS_GENERATE, data });
  return res.data;
};

/**
 * DELETE /fuse/workflows/:id â€” removes a workflow by ID.
 * @param {string} id
 */
export const deleteWorkflowAPI = async (id) => {
  const res = await api({ method: "DELETE", url: ENDPOINTS.FUSE_WORKFLOW(id) });
  return res.data;
};

/**
 * GET /fuse/workflows/:id â€” fetches a single workflow by ID.
 * @param {string} id
 */
export const getWorkflowByIdAPI = async (id) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_WORKFLOW(id) });
  return res.data;
};

/**
 * PATCH /fuse/workflows/:id/name â€” updates the workflow name.
 * @param {string} id
 * @param {string} name
 */
export const updateWorkflowNameAPI = async (id, name) => {
  const res = await api({ method: "PATCH", url: ENDPOINTS.FUSE_WORKFLOW_NAME(id), data: { name } });
  return res.data;
};

/**
 * PATCH /fuse/workflows/:id/graph â€” persists the React Flow node/edge graph.
 *
 * @param {string} id
 * @param {Array}  nodes   Workflow-logic nodes only (fuse_node type)
 * @param {Array}  edges   Workflow edges
 * @param {Array}  [blocks=[]]  Visual block overlays (fuse_block type).
 *                              Stored separately, never compiled.
 */
export const updateWorkflowGraphAPI = async (id, nodes, edges, blocks = []) => {
  const res = await api({
    method: "PATCH",
    url: ENDPOINTS.FUSE_WORKFLOW_GRAPH(id),
    data: { nodes, edges, blocks },
  });
  return res.data;
};

/**
 * PATCH /fuse/workflows/:id/status â€” toggle active / inactive.
 * @param {string} id
 * @param {"active"|"inactive"} status
 */
export const updateWorkflowStatusAPI = async (id, status) => {
  const res = await api({ method: "PATCH", url: ENDPOINTS.FUSE_WORKFLOW_STATUS(id), data: { status } });
  return res.data;
};

// â"€â"€â"€ Node definitions â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

/**
 * GET /fuse/nodes/starter — listing metadata only (no config_form).
 */
export const getStarterNodesAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_NODES_STARTER });
  return res.data;
};

/**
 * GET /fuse/nodes/actions — listing metadata only (no config_form).
 */
export const getActionNodesAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_NODES_ACTIONS });
  return res.data;
};

/**
 * GET /fuse/nodes/:nodeType — full node definition (config_form, defaults, …).
 */
export const getFuseNodeDefinitionAPI = async (nodeType) => {
  const res = await api({
    method: "GET",
    url: ENDPOINTS.FUSE_NODE_DEFINITION(nodeType),
  });
  return res.data;
};

export const getSystemVariablesAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_NODES_SYSTEM_VARIABLES });
  return res.data;
};

/**
 * GET /fuse/integration â€” returns all available integrations.
 */
export const getIntegrationsAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATIONS });
  return res.data;
};

/**
 * GET /fuse/integration/gmail/info â€” returns Gmail integration details.
 */
export const getGmailIntegrationInfoAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_GMAIL_INFO });
  return res.data;
};

/**
 * GET /fuse/integration/gmail/auth â€” start Gmail OAuth.
 */
export const startGmailAuthAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_GMAIL_AUTH });
  return res.data;
};

/**
 * GET /fuse/integration/webex/info â€” returns Webex integration details.
 */
export const getWebexIntegrationInfoAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_WEBEX_INFO });
  return res.data;
};

/**
 * GET /fuse/integration/webex/auth â€” start Webex OAuth.
 */
export const startWebexAuthAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_WEBEX_AUTH });
  return res.data;
};

/**
 * GET /fuse/integration/webex/rooms â€” list Webex spaces for room picker.
 */
export const getWebexRoomsAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_WEBEX_ROOMS });
  return res.data;
};

/**
 * GET /fuse/integration/webex/people â€” list Webex people for destination picker.
 */
export const getWebexPeopleAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_WEBEX_PEOPLE });
  return res.data;
};

/**
 * GET /fuse/integration/webex/webhooks â€” list Webex webhooks for the linked account.
 */
export const getWebexWebhooksAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_WEBEX_WEBHOOKS });
  return res.data;
};

/**
 * DELETE /fuse/integration/webex/webhooks/:id â€” remove a Webex webhook.
 */
export const deleteWebexWebhookAPI = async (webhookId) => {
  const res = await api({ method: "DELETE", url: ENDPOINTS.FUSE_INTEGRATION_WEBEX_WEBHOOK(webhookId) });
  return res.data;
};

/**
 * GET /fuse/integration/google_sheets/info â€” returns Google Sheets integration details.
 */
export const getGoogleSheetsIntegrationInfoAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_GOOGLE_SHEETS_INFO });
  return res.data;
};

/**
 * GET /fuse/integration/google_sheets/auth â€” start Google Sheets OAuth.
 */
export const startGoogleSheetsAuthAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_GOOGLE_SHEETS_AUTH });
  return res.data;
};

/**
 * GET /fuse/integration/google_sheets/spreadsheets â€” list Google Sheets files.
 * @param {{ limit?: number, search?: string }} params
 * @returns {{ spreadsheets: Array<{id, label}>, total: number }}
 */
export const getGoogleSheetsSpreadsheetListAPI = async (params = {}) => {
  const res = await api({
    method: "GET",
    url: ENDPOINTS.FUSE_INTEGRATION_GOOGLE_SHEETS_SPREADSHEETS,
    params,
  });
  return res.data;
};

/**
 * GET /fuse/integration/google_sheets/sheets?spreadsheet_id=... â€” list sheet tabs.
 * @param {string} spreadsheetId
 * @returns {{ sheets: Array<{id, label}>, total: number }}
 */
export const getGoogleSheetTabsAPI = async (spreadsheetId) => {
  const res = await api({
    method: "GET",
    url: ENDPOINTS.FUSE_INTEGRATION_GOOGLE_SHEETS_SHEETS,
    params: { spreadsheet_id: spreadsheetId },
  });
  return res.data;
};

/**
 * GET /fuse/integration/google_sheets/columns?spreadsheet_id=...&sheet_name=... â€” get header row.
 * @param {string} spreadsheetId
 * @param {string} sheetName
 * @returns {{ columns: string[] }}
 */
export const getGoogleSheetColumnsAPI = async (spreadsheetId, sheetName) => {
  const res = await api({
    method: "GET",
    url: ENDPOINTS.FUSE_INTEGRATION_GOOGLE_SHEETS_COLUMNS,
    params: { spreadsheet_id: spreadsheetId, sheet_name: sheetName },
  });
  return res.data;
};

/**
 * GET /fuse/integration/github/info â€” returns Github integration details.
 */
export const getGithubIntegrationInfoAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_GITHUB_INFO });
  return res.data;
};

/**
 * GET /fuse/integration/github/auth â€” start Github OAuth.
 */
export const startGithubAuthAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_GITHUB_AUTH });
  return res.data;
};

export const getGithubReposAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_GITHUB_REPOS });
  return res.data;
};

export const getGithubBranchesAPI = async (repoName) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_GITHUB_BRANCHES, params: { repo_name: repoName } });
  return res.data;
};

/**
 * GET /fuse/integration/github/webhooks â€” list GitHub webhooks for the linked account.
 */
export const getGithubWebhooksAPI = async (repoName) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_INTEGRATION_GITHUB_WEBHOOKS, params: { repo_name: repoName } });
  return res.data;
};

/**
 * DELETE /fuse/integration/github/webhooks/:id â€” remove a GitHub webhook.
 */
export const deleteGithubWebhookAPI = async (webhookId, repoName) => {
  const res = await api({ method: "DELETE", url: ENDPOINTS.FUSE_INTEGRATION_GITHUB_WEBHOOK(webhookId), params: { repo_name: repoName } });
  return res.data;
};

/**
 * DELETE /fuse/integration/:id â€” revoke integration.
 */
export const revokeIntegrationAPI = async (id) => {
  const res = await api({ method: "DELETE", url: ENDPOINTS.FUSE_INTEGRATION_REVOKE(id) });
  return res.data;
};

// â"€â"€â"€ Execution control â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

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

// â"€â"€â"€ Web Push â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

/** GET /fuse/push/vapid-public-key â€” returns the server's VAPID public key. */
export const getVapidPublicKeyAPI = async () => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_PUSH_VAPID_KEY });
  return res.data.public_key;
};

/**
 * POST /fuse/push/subscribe â€” saves a PushSubscription for the current user.
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
 * POST /fuse/push/unsubscribe â€” removes a push subscription by endpoint.
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

// â"€â"€â"€ Runs â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

/**
 * GET /fuse/workflows/:id/runs â€” returns a paginated page of runs for a workflow.
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
 * GET /fuse/runs/:runId â€” fetch a single run document.
 * @param {string} runId
 */
export const getRunAPI = async (runId) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_RUN(runId) });
  return res.data;
};

/**
 * GET /fuse/runs/:runId/logs â€” fetch a paginated page of node logs for a run.
 * @param {string} runId
 * @param {{ limit?: number, after_started_at?: string, after_log_id?: string }} params
 * @returns {{ items: object[], next_cursor: object|null }}
 */
export const getRunLogsAPI = async (runId, params = {}) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_RUN_LOGS(runId), params });
  return res.data; // { items, next_cursor }
};

/**
 * GET /fuse/runs/:runId/live-config â€” WebSocket URL for live run streaming.
 * @param {string} runId
 * @returns {{ ws_url: string, run_id: string }}
 */
export const getRunLiveConfigAPI = async (runId) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_RUN_LIVE_CONFIG(runId) });
  return res.data;
};

/**
 * GET /fuse/workflows/:id/runs/live-config â€” WebSocket URL for live run-list updates.
 * @param {string} workflowId
 * @returns {{ ws_url: string, workflow_id: string }}
 */
export const getWorkflowRunsLiveConfigAPI = async (workflowId) => {
  const res = await api({
    method: "GET",
    url: ENDPOINTS.FUSE_WORKFLOW_RUNS_LIVE_CONFIG(workflowId),
  });
  return res.data;
};

// â"€â"€â"€ Versions â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

/**
 * GET /fuse/workflows/:id/versions â€” list compiled graph versions (slim, no graph body).
 * @param {string} workflowId
 */
export const getWorkflowVersionsAPI = async (workflowId) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_WORKFLOW_VERSIONS(workflowId) });
  return res.data;
};

/**
 * GET /fuse/versions/:versionId â€” fetch a single version including the full compiled_graph.
 * @param {string} versionId
 */
export const getVersionAPI = async (versionId) => {
  const res = await api({ method: "GET", url: ENDPOINTS.FUSE_VERSION(versionId) });
  return res.data;
};