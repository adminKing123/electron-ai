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
    nodes: [],
    edges: [],
    createdAt: "2026-05-10T09:14:00Z",
    updatedAt: "2026-06-01T13:22:00Z",
  },
  {
    id: "wf_002",
    name: "Daily Report Generator",
    status: "inactive",
    nodes: [],
    edges: [],
    createdAt: "2026-05-18T11:00:00Z",
    updatedAt: "2026-05-30T08:45:00Z",
  },
  {
    id: "wf_003",
    name: "Slack Notification Dispatcher",
    status: "active",
    nodes: [],
    edges: [],
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
    nodes: [],
    edges: [],
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

/**
 * GET /fuse/workflows/:id — fetches a single workflow by ID.
 * @param {string} id
 */
export const getWorkflowByIdAPI = async (id) => {
  await delay(500);
  const found = MOCK_WORKFLOWS.find((wf) => wf.id === id);
  if (!found) throw new Error(`Workflow ${id} not found`);
  return { ...found };
};

/**
 * PATCH /fuse/workflows/:id — updates the workflow name.
 * @param {string} id
 * @param {string} name
 */
export const updateWorkflowNameAPI = async (id, name) => {
  await delay(300);
  return { id, name, updatedAt: new Date().toISOString() };
};

/**
 * GET /fuse/nodes/starter — returns all available starter node definitions.
 *
 * Each node definition contains everything the frontend needs to:
 *   1. Render the node card in the StarterPanel
 *   2. Build the configuration form dynamically via FormBuilder
 *
 * Schema per node:
 * {
 *   type:        string          — unique node type key
 *   label:       string          — display name shown on the node card and config header
 *   icon:        string          — key into the client-side ICON_REGISTRY (iconRegistry.js)
 *   description: string          — shown on the card and at the top of the config panel
 *   config_form: {
 *     presets:  [{ label, values }]
 *     sections: [{ title?, layout?, fields: [{ key, label, type, required?, hint?, after_hint?, options? }] }]
 *   }
 * }
 */
export const getStarterNodesAPI = async () => {
  await delay(400);
  return [
    {
      type: "schedule",
      label: "On a Schedule",
      icon: "TbCalendarTime",
      description:
        "Start at a set date and time. Have it run once or repeat on a schedule.",
      config_form: {
        presets: [
          {
            label: "Monday at 8 AM",
            values: { date: "next-monday", time: "08:00", repeat: "weekly_monday", ends: "1y" },
          },
          {
            label: "Weekdays at 8 AM",
            values: { date: "today", time: "08:00", repeat: "weekdays", ends: "1y" },
          },
          {
            label: "In 5 minutes",
            values: { date: "today", time: "+5min", repeat: "none", ends: "1y" },
          },
        ],
        sections: [
          {
            title: "Start date and time",
            layout: "grid-2",
            fields: [
              {
                key: "date",
                label: "Date",
                type: "date",
                required: true,
                hint: "MM/DD/YYYY",
              },
              {
                key: "time",
                label: "Time",
                type: "time",
                required: true,
              },
            ],
          },
          {
            fields: [
              {
                key: "repeat",
                label: "Repeat",
                type: "select",
                required: true,
                options: [
                  { label: "Does not repeat", value: "none" },
                  { label: "Hourly", value: "hourly" },
                  { label: "Daily", value: "daily" },
                  { label: "Weekly on Monday", value: "weekly_monday" },
                  { label: "Weekdays (Mon\u2013Fri)", value: "weekdays" },
                  { label: "Monthly", value: "monthly" },
                  { label: "Annually", value: "annually" },
                ],
                after_hint:
                  "For daily and less frequent repeats, runs start within 3 minutes of the set time",
              },
              {
                key: "ends",
                label: "Ends",
                type: "select",
                options: [
                  { label: "1 year", value: "1y" },
                  { label: "6 months", value: "6m" },
                  { label: "3 months", value: "3m" },
                  { label: "1 month", value: "1m" },
                  { label: "Never", value: "never" },
                ],
              },
              {
                key: "timezone",
                label: "Time zone",
                type: "timezone_select",
                required: true,
              },
            ],
          },
        ],
      },
    },
  ];
};
