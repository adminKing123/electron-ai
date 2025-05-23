import api from "..";
import CONFIG from "../../config";
import ENDPOINTS from "../endpoints";

export const getAIModelsAPI = async () => {
  let data = {};
  if (CONFIG.CALL_GET_AI_MODELS_API) {
    const response = await api({
      method: "GET",
      url: ENDPOINTS.GET_MODELS,
    });

    const models = Object.values(response.data.models)
      .filter((model) => model.active === "True")
      .map((model) => ({
        ...model,
      }));

    const default_model = models.find(
      (model) => response.data.default_llm_id.id === model.id
    );

    data = {
      models,
      default_model,
    };
  } else {
    data = {
      models: [
        {
          id: "gemini-2.5-pro-preview-05-06",
          name: "Gemini-2.5-Pro",
          google_search: true,
          active: "True",
          description: "Best for complex tasks.",
        },
        {
          id: "gemini-2.5-flash-preview-04-17",
          name: "Gemini-2.5-Flash",
          google_search: true,
          active: "True",
          description: "Fast and efficient.",
        },
        {
          id: "gemini-2.0-flash-001",
          name: "Gemini-2.0-Flash",
          google_search: true,
          active: "True",
          description: "Light and quick.",
        },
        {
          id: "claude-3-5-sonnet-v2@20241022",
          name: "Claude-3.5-Sonnet",
          google_search: false,
          active: "True",
          description: "Great all-rounder.",
        },
        {
          id: "gemini-1.5-pro-002",
          name: "Gemini-1.5-Pro",
          google_search: true,
          active: "True",
          description: "Strong problem-solver.",
        },
      ],
      default_model: {
        id: "gemini-2.0-flash-001",
        name: "Gemini-2.0-Flash",
        google_search: true,
        active: "True",
        description: "Light and quick.",
      },
    };
  }
  return data;
};
