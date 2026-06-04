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

/** GET /fuse/workflows — returns all workflows for the current user. */
export const getWorkflowsAPI = () =>
  Promise.resolve([...MOCK_WORKFLOWS]);

/**
 * POST /fuse/workflows — creates a new workflow.
 * @param {{ name: string }} data
 */
export const createWorkflowAPI = (data) => {
  const now = new Date().toISOString();
  return Promise.resolve({
    id: `wf_${Date.now()}`,
    name: data.name,
    createdAt: now,
    updatedAt: now,
  });
};

/**
 * DELETE /fuse/workflows/:id — removes a workflow by ID.
 * @param {string} id
 */
export const deleteWorkflowAPI = (id) =>
  Promise.resolve({ success: true, id });
