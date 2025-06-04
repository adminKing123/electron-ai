import { doc, setDoc } from "firebase/firestore";
import api from "..";
import useUserStore from "../../store/useUserStore";
import ENDPOINTS from "../endpoints";
import { db } from "../../firebase";

export const deleteMessageAPI = async (data) => {
  const user = useUserStore.getState().DEFAULT_USER;
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

export const createMessageAPI = async (chat, message) => {
  const user = useUserStore.getState().user;

  const docRef = doc(
    db,
    "users",
    user.uid,
    "chats",
    chat.id,
    "messages",
    message.id
  );
  await setDoc(docRef, message);

  return {
    ...message,
    docRef,
  };
};
