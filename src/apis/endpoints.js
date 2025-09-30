import CONFIG from "../config";
import { useModelStore } from "../store/usePromptStores";

const ENDPOINTS = {
  GET_MODELS: "/get_models",
  DELETE_MESSAGE: "/delete_message",
  SUMMARISE_CHAT_TITLE: "/summarise_title",
  GET_GENERATE_URL: function () {
    const ai_type = useModelStore.getState().type;
    if (ai_type.id === "ARHYTHM_ASSISTANT") {
      return `${CONFIG.ARSONGS_AI_API_URL}/generate`;
    }
    return `${CONFIG.API_BASE_URL}/generate`;
  },
  DELETE_CHAT: (userId, chatId) => `/delete_chat/${userId}/${chatId}`,
};

export default ENDPOINTS;
