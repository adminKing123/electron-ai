import api from "..";
import ENDPOINTS from "../endpoints";

export const getLiveSessionIdAPI = async () => {
  const response = await api({
    method: "GET",
    url: ENDPOINTS.AURA_VOICE_GET_SESSION_ID,
  });
  return response.data;
};
