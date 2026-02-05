const ROUTES = {
  INDEX: "/",
  AUTH: "/auth",
  CHAT_PAGE: "/c/:id",
  GET_CHAT_PAGE_URL: (id) => `/c/${id}`,
  LIBRARY: "/library",

  AURA_RJ: "/aura-rj",
  CODIGO: "/codigo",
};

export default ROUTES;
