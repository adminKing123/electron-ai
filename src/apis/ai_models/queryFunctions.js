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
          description:
            "Best for complex reasoning, coding, and creative writing with top-tier performance",
        },
        {
          id: "gemini-2.5-flash-preview-04-17",
          name: "Gemini-2.5-Flash",
          google_search: true,
          active: "True",
          description:
            "Fastest Gemini model for quick, cost-effective responses to everyday tasks.",
        },
        {
          id: "gemini-2.0-flash-001",
          name: "Gemini-2.0-Flash",
          google_search: true,
          active: "True",
          description:
            "Lightweight and speedy for basic queries and less intensive tasks.",
        },
        {
          id: "claude-3-5-sonnet-v2@20241022",
          name: "Claude-3.5-Sonnet",
          google_search: false,
          active: "True",
          description:
            "Strong balance of creativity, logic, and conversation great for general use.",
        },
        {
          id: "gemini-1.5-pro-002",
          name: "Gemini-1.5-Pro",
          google_search: true,
          active: "True",
          description:
            "Advanced model for research and nuanced problem-solving, with good coding skills.",
        },
      ],
      default_model: {
        id: "gemini-2.0-flash-001",
        name: "Gemini-2.0-Flash",
        google_search: true,
        active: "True",
        description:
          "Lightweight and speedy for basic queries and less intensive tasks.",
      },
    };
  }
  return data;
};
