import CONFIG from "../config";

const ENDPOINTS = {
  GET_MODELS: "/get_models",
  DELETE_MESSAGE: "/delete_message",
  SUMMARISE_CHAT_TITLE: "/summarise_title",
  GET_GENERATE_URL: function () {
    return `${CONFIG.API_BASE_URL}/generate`;
  },
  DELETE_CHAT: (userId, chatId) => `/delete_chat/${userId}/${chatId}`,
  RENAME_CHAT: (userId, chatId) => `/rename_chat/${userId}/${chatId}`,
  GET_UPLOAD_FILE: () => `${CONFIG.API_BASE_URL}/upload_file`,
  GET_DELETE_FILE: (filename) =>
    `${CONFIG.API_BASE_URL}/delete_file/${filename}`,

  GET_DOWNLOAD_URI: (download_path) => `${download_path}`,
};

export default ENDPOINTS;
