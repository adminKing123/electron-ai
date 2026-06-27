import CONFIG from "../config";
import useUserStore from "../store/useUserStore";

const ENDPOINTS = {
  GET_MODELS: "/get_models",
  DELETE_MESSAGE: "/delete_message",
  SUMMARISE_CHAT_TITLE: "/summarise_title",
  GET_GENERATE_URL: function () {
    return `${CONFIG.API_BASE_URL}/generate`;
  },
  GET_STOP_GENERATION_URL: (messageId) => 
    `${CONFIG.API_BASE_URL}/generate/stop/${messageId}`,
  
  DELETE_CHAT: (userId, chatId) => `/delete_chat/${userId}/${chatId}`,
  RENAME_CHAT: (userId, chatId) => `/rename_chat/${userId}/${chatId}`,
  GET_UPLOAD_FILE: () => `${CONFIG.FILE_CDN_URL}/upload_file`,
  GET_DELETE_FILE: (filename) =>
    `${CONFIG.FILE_CDN_URL}/delete_file/${filename}`,

  GET_DOWNLOAD_URI: (download_path = "") => {
    const user = useUserStore.getState().user;
    if (user?.email === CONFIG.SUPER_ADMIN_EMAIL)
      return download_path.replace(
        `${CONFIG.FILE_CDN_URL}/download`,
        CONFIG.FILE_CDN_URL_2,
      );
    return download_path;
  },

  AURA_RJ_GET_TRACK: "/aura-rj/get-track",

  GET_CONFIG: "/get-config",

  TTS_SPEAK: "/tts/speak",

  // ── Fuse Workflows ──────────────────────────────────────────────────────────
  FUSE_WORKFLOWS:               "/fuse/workflows",
  FUSE_WORKFLOWS_GENERATE:      "/fuse/workflows/generate",
  FUSE_DISCOVER:                "/fuse/discover",
  FUSE_WORKFLOW:                (id) => `/fuse/workflows/${id}`,
  FUSE_WORKFLOW_NAME:           (id) => `/fuse/workflows/${id}/name`,
  FUSE_WORKFLOW_GRAPH:          (id) => `/fuse/workflows/${id}/graph`,
  FUSE_WORKFLOW_STATUS:         (id) => `/fuse/workflows/${id}/status`,
  FUSE_WORKFLOW_ACTIVATE:       (id) => `/fuse/workflows/${id}/activate`,
  FUSE_WORKFLOW_DEACTIVATE:     (id) => `/fuse/workflows/${id}/deactivate`,
  FUSE_NODES_STARTER:           "/fuse/nodes/starter",
  FUSE_NODES_ACTIONS:           "/fuse/nodes/actions",
  FUSE_INTEGRATIONS:            "/fuse/integration",

  // ── Fuse Push Notifications ─────────────────────────────────────────────────
  FUSE_PUSH_VAPID_KEY:          "/fuse/push/vapid-public-key",
  FUSE_PUSH_SUBSCRIBE:          "/fuse/push/subscribe",
  FUSE_PUSH_UNSUBSCRIBE:        "/fuse/push/unsubscribe",

  // ── Fuse Runs & Logs ────────────────────────────────────────────────────────
  FUSE_WORKFLOW_RUNS:   (id) => `/fuse/workflows/${id}/runs`,
  FUSE_RUN:             (runId) => `/fuse/runs/${runId}`,
  FUSE_RUN_LOGS:        (runId) => `/fuse/runs/${runId}/logs`,

  // ── Fuse Compiled Versions ───────────────────────────────────────────────────
  FUSE_WORKFLOW_VERSIONS: (id) => `/fuse/workflows/${id}/versions`,
  FUSE_VERSION:           (versionId) => `/fuse/versions/${versionId}`,

  // ── Integrations ────────────────────────────────────────────────────────────
  FUSE_INTEGRATION_GMAIL_INFO:  "/fuse/integration/gmail/info",
  FUSE_INTEGRATION_GMAIL_AUTH:  "/fuse/integration/gmail/auth",
  FUSE_INTEGRATION_REVOKE:      (id) => `/fuse/integration/${id}`,
};

export default ENDPOINTS;
