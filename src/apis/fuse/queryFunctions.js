/**
 * Fuse Workflows — API query functions.
 *
 * All functions are currently backed by mock data.
 * Replace the implementations with real `api({ ... })` calls
 * once the backend endpoints are available.
 */

/* ── Mock dataset ──────────────────────────────────────── */
const MOCK_WORKFLOWS = [
  {
    id: "wf_001",
    name: "Lead Enrichment",
    status: "active",
    createdAt: "2026-05-10T09:14:00Z",
    updatedAt: "2026-06-01T13:22:00Z",
  },
  {
    id: "wf_002",
    name: "Daily Report Generator",
    status: "inactive",
    createdAt: "2026-05-18T11:00:00Z",
    updatedAt: "2026-05-30T08:45:00Z",
  },
  {
    id: "wf_003",
    name: "Slack Notification Dispatcher",
    status: "active",
    createdAt: "2026-05-22T15:30:00Z",
    updatedAt: "2026-06-03T17:10:00Z",
  },
];

/** Artificial delay to simulate network latency during development. */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** GET /fuse/workflows — returns all workflows for the current user. */
export const getWorkflowsAPI = async () => {
  await delay(1200);
  return [...MOCK_WORKFLOWS];
};

/**
 * POST /fuse/workflows — creates a new workflow.
 * @param {{ name: string }} data
 */
export const createWorkflowAPI = async (data) => {
  await delay(800);
  const now = new Date().toISOString();
  return {
    id: `wf_${Date.now()}`,
    name: data.name,
    status: "inactive",
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * DELETE /fuse/workflows/:id — removes a workflow by ID.
 * @param {string} id
 */
export const deleteWorkflowAPI = async (id) => {
  await delay(600);
  return { success: true, id };
};
