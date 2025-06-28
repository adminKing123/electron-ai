import api from "..";
import ENDPOINTS from "../endpoints";

export const getAIModelsAPI = async () => {
  const response = await api({
    method: "GET",
    url: ENDPOINTS.GET_MODELS,
  });

  return response.data;
};
