import api from "..";
import ENDPOINTS from "../endpoints";

export const getTrackAPI = async (data) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.AURA_RJ_GET_TRACK,
    data: {
      session_id: data.session_id,
      user_id: data.user_id,
      context: data.context,
    },
  });
  return response.data;
};
