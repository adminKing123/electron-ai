import api from "..";
import useUserStore from "../../store/useUserStore";
import ENDPOINTS from "../endpoints";

export const summariseChatTitleAPI = async (data) => {
  const user = useUserStore.getState().DEFAULT_USER;
  const response = await api({
    method: "POST",
    url: ENDPOINTS.SUMMARISE_CHAT_TITLE,
    data: {
      prompt: data.prompt_to_summerize_title,
      prompt_id: data.message_id,
      org_id: user.org_id ? user.org_id : "",
      chat_id: data.chat_id,
      user_id: user.uid ? user.uid : "",
    },
  });
  return response.data;
};
