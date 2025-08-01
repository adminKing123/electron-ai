import CONFIG from "../config";

const ENDPOINTS = {
  GET_MODELS: "/get_models",
  DELETE_MESSAGE: "/delete_message",
  SUMMARISE_CHAT_TITLE: "/summarise_title",
  GET_GENERATE_URL: function () {
    return `${CONFIG.API_BASE_URL}/generate`;
  },
};

export default ENDPOINTS;
