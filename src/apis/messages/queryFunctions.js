import api from "..";
import useUserStore from "../../store/useUserStore";
import ENDPOINTS from "../endpoints";

export const deleteMessageAPI = async (data) => {
  const user = useUserStore.getState().user;
  const response = await api({
    method: "POST",
    url: ENDPOINTS.DELETE_MESSAGE,
    data: {
      prompt_id: data.message_id,
      org_id: user.org_id ? user.org_id : "",
      chat_id: data.chat_id,
      user_id: user.uid ? user.uid : "",
      by: user.uid ? user.uid : "",
    },
  });

  return response.data;
};
