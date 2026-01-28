import CONFIG from "../config";
import useUserStore from "../store/useUserStore";

const ENDPOINTS = {
  GET_MODELS: "/get_models",
  DELETE_MESSAGE: "/delete_message",
  SUMMARISE_CHAT_TITLE: "/summarise_title",
  GET_GENERATE_URL: function () {
    return `${CONFIG.API_BASE_URL}/generate`;
  },
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
};

export default ENDPOINTS;
