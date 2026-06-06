const ROUTES = {
  INDEX: "/",
  AUTH: "/auth",
  CHAT_PAGE: "/c/:id",
  GET_CHAT_PAGE_URL: (id) => `/c/${id}`,
  LIBRARY: "/library",
  ANALYTICS: "/analytics",

  AURA_RJ: "/aura-rj",

  FUSE: "/fuse",
  FUSE_STUDIO: "/fuse/studio/:id",
  GET_FUSE_STUDIO_URL: (id) => `/fuse/studio/${id}`,

  FUSE_RUNS: "/fuse/studio/:id/runs",
  GET_FUSE_RUNS_URL: (id) => `/fuse/studio/${id}/runs`,
  FUSE_RUN_DETAIL: "/fuse/runs/:runId",
  GET_FUSE_RUN_DETAIL_URL: (runId) => `/fuse/runs/${runId}`,
};

export default ROUTES;
