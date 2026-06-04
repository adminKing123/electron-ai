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
    {
      type: "webhook",
      label: "On Webhook",
      icon: "TbWebhook",
      description:
        "Start the workflow whenever an HTTP request hits the generated webhook URL.",
      config_form: {
        sections: [
          {
            title: "Endpoint",
            fields: [
              {
                key: "method",
                label: "HTTP Method",
                type: "select",
                required: true,
                options: [
                  { label: "POST", value: "POST" },
                  { label: "GET",  value: "GET"  },
                  { label: "PUT",  value: "PUT"  },
                  { label: "PATCH", value: "PATCH" },
                ],
                hint: "Only requests matching this method will trigger the workflow",
              },
              {
                key: "path",
                label: "Custom Path (optional)",
                type: "text",
                placeholder: "e.g. /orders/new",
                hint: "Leave blank to use the auto-generated path",
              },
            ],
          },
          {
            title: "Security",
            fields: [
              {
                key: "auth_type",
                label: "Authentication",
                type: "select",
                options: [
                  { label: "None",        value: "none"        },
                  { label: "Bearer token", value: "bearer"     },
                  { label: "Basic auth",  value: "basic"       },
                  { label: "HMAC signature", value: "hmac"     },
                ],
                hint: "How the webhook verifies that the request is from a trusted sender",
              },
              {
                key: "secret",
                label: "Secret / Token",
                type: "text",
                placeholder: "Paste your secret here",
                hint: "Used to verify the HMAC signature or as the expected bearer token",
              },
            ],
          },
          {
            title: "Response",
            fields: [
              {
                key: "response_code",
                label: "Status Code",
                type: "number",
                placeholder: "200",
                hint: "HTTP status returned immediately to the caller",
              },
            ],
          },
          {
            title: "Body Schema",
            fields: [
              {
                key: "body_schema",
                label: "Incoming Body Fields",
                type: "body_builder",
                hint: "Define the fields you expect in the webhook request body. These become variables you can reference in downstream nodes using {{webhook.body.fieldName}}.",
              },
            ],
          },
        ],
      },
    },
  ];
};

/**
 * GET /fuse/nodes/actions — returns all available action node definitions.
 *
 * Action nodes are the building blocks connected after the starter trigger.
 * Each definition follows the same schema as starter nodes, with a full
 * config_form so FormBuilder can render the configuration UI dynamically.
 */
export const getActionNodesAPI = async () => {
  await delay(300);
  return [
    {
      type: "get_notified",
      label: "Get Notified",
      icon: "TbBell",
      section: "Notifications",
      description:
        "Send a web push notification to yourself when this workflow step is reached.",
      config_form: {
        sections: [
          {
            title: "Content",
            fields: [
              {
                key: "title",
                label: "Title",
                type: "variable_text",
                placeholder: "e.g. Your report is ready",
                required: true,
                hint: "Short headline shown in bold. Use @ to insert a variable.",
              },
              {
                key: "body",
                label: "Body",
                type: "variable_textarea",
                placeholder: "e.g. The weekly sales report has been generated.",
                required: true,
                hint: "Main notification text. Use @ to insert a variable.",
              },
              {
                key: "icon_url",
                label: "Icon URL",
                type: "variable_text",
                placeholder: "https://example.com/icon-192.png",
                hint: "Square image (192×192 px recommended) shown beside the notification",
              },
              {
                key: "image_url",
                label: "Banner Image URL",
                type: "variable_text",
                placeholder: "https://example.com/banner.png",
                hint: "Large image displayed below the body on supported browsers",
              },
            ],
          },
          {
            title: "Action",
            fields: [
              {
                key: "click_url",
                label: "Click URL",
                type: "variable_text",
                placeholder: "https://app.example.com/dashboard",
                hint: "Page to open when the notification is clicked; defaults to the app URL",
              },
              {
                key: "cta_label",
                label: "Button Label",
                type: "variable_text",
                placeholder: "e.g. View Report",
                hint: "Optional action button shown inside the notification",
              },
            ],
          },
          {
            title: "Options",
            layout: "grid-2",
            fields: [
              {
                key: "require_interaction",
                label: "Require Interaction",
                type: "select",
                options: [
                  { label: "No \u2014 dismiss automatically", value: "false" },
                  { label: "Yes \u2014 stay until dismissed", value: "true" },
                ],
                hint: "Keep the notification visible until the user actively dismisses it",
              },
              {
                key: "ttl_seconds",
                label: "Time to Live (sec)",
                type: "number",
                placeholder: "86400",
                hint: "How long the browser retries delivery if you are offline",
              },
            ],
          },
        ],
      },
    },
    {
      type: "if_else",
      label: "If / Else",
      icon: "TbGitBranch",
      section: "Logic",
      description:
        "Branch the workflow based on a condition. The True path runs when the condition passes; the False path runs otherwise.",
      config_form: {
        sections: [
          {
            title: "Condition",
            fields: [
              {
                key: "condition",
                label: "Condition",
                type: "condition_builder",
                hint: "Select a variable, choose an operator, and (if needed) enter a comparison value. Connect the True and False handles on the node to route each branch.",
              },
            ],
          },
        ],
      },
    },
  ];
};
