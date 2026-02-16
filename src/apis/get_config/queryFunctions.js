import api from "..";
import ENDPOINTS from "../endpoints";

export const getConfigAPI = async ({ successCallback }) => {
  const response = await api({
    method: "GET",
    url: ENDPOINTS.GET_CONFIG,
  });

  if (successCallback) {
    successCallback(response.data);
  }

  return response.data;
};
