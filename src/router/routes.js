const ROUTES = {
  INDEX: "/",
  AUTH: "/auth",
  CHAT_PAGE: "/c/:id",
  GET_CHAT_PAGE_URL: (id) => `/c/${id}`,
  LIBRARY: "/library",
  ANALYTICS: "/analytics",

  AURA_RJ: "/aura-rj",

  FUSE: "/fuse",
};

export default ROUTES;
