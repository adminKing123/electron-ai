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
};

export default ROUTES;
