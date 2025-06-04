import { setDoc, doc } from "firebase/firestore";
import api from "..";
import { db } from "../../firebase";
import useUserStore from "../../store/useUserStore";
import ENDPOINTS from "../endpoints";

export const summariseChatTitleAPI = async (data) => {
  const user = useUserStore.getState().DEFAULT_USER;

  const STATIC_DATA = {
    prompt_id: "e74d7cdf-fa32-459e-bd7c-8712d0ac63f8",
    chat_id: "6b3f0f40-ee89-4320-b787-1a00f623e8b5",
  };

  const response = await api({
    method: "POST",
    url: ENDPOINTS.SUMMARISE_CHAT_TITLE,
    data: {
      prompt: data.prompt_to_summerize_title,
      prompt_id: STATIC_DATA.prompt_id,
      chat_id: STATIC_DATA.chat_id,
      org_id: user.org_id,
      user_id: user.uid,
    },
  });
  return response.data;
};

export const createChatAPI = async (data) => {
  const user = useUserStore.getState().user;
  const payload = {
    title: data.title,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  const docRef = doc(db, "users", user.uid, "chats", data.id);
  await setDoc(docRef, payload);

  return {
    id: data.id,
    ...payload,
  };
};
