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
        // {
        //   id: "gemini-2.5-flash-preview-05-20",
        //   name: "Gemini 2.5 Flash",
        //   google_search: true,
        //   active: "True",
        //   from: "GEMINI",
        //   description: "Fast and cost-efficient.",
        // },
        {
          id: "gemini-2.5-pro-preview-05-06",
          name: "Gemini 2.5 Pro",
          google_search: true,
          active: "True",
          from: "GEMINI",
          description: "Advanced and powerful.",
        },
        // {
        //   id: "claude-sonnet-4@20250514",
        //   name: "Claude Sonnet 4",
        //   google_search: false,
        //   active: "True",
        //   from: "CLAUDE",
        //   description: "Balanced and capable.",
        // },
        {
          id: "claude-opus-4@20250514",
          name: "Claude Opus 4",
          google_search: false,
          active: "True",
          from: "CLAUDE",
          description: "High-end and smart.",
        },
      ],
      default_model: {
        id: "claude-opus-4@20250514",
        name: "Claude Opus 4",
        google_search: false,
        active: "True",
        from: "CLAUDE",
        description: "High-end and smart.",
      },
    };
  }
  return data;
};
