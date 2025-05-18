export const getAIModels = async () => {
  const response = await api({
    method: "GET",
    url: ENDPOINTS.GET_MODELS,
  });
  const default_model_id = response.data.default_llm_id.id;
  return Object.values(response.data.models)
    .filter((model) => model.active === "True")
    .map((model) => ({
      ...model,
      is_default: model.id === default_model_id,
    }));
};
