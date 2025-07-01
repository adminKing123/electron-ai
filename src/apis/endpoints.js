import CONFIG from "../config";
import { useMutliModelGeneration } from "../store/usePromptStores";

const ENDPOINTS = {
  GET_MODELS: "/get_models",
  DELETE_MESSAGE: "/delete_message",
  SUMMARISE_CHAT_TITLE: "/summarise_title",
  GET_GENERATE_URL: function () {
    const isMultiModelGeneration =
      useMutliModelGeneration.getState().isMultiModelGeneration;
    if (isMultiModelGeneration) {
      return `${CONFIG.API_BASE_URL}/generate_v2`;
    }
    return `${CONFIG.API_BASE_URL}/generate`;
  },
};

export default ENDPOINTS;
