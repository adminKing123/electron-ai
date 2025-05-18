import api from "..";
import ENDPOINTS from "../endpoints";

export const getAIModels = async () => {
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
  
  return {
    models,
    default_model,
  };
};
