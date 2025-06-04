import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import api from "..";
import useUserStore from "../../store/useUserStore";
import ENDPOINTS from "../endpoints";
import { db } from "../../firebase";
import { getChatAPI } from "../chats/queryFunctions";

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

export const getMessagesAPI = async (chat) => {
  const user = useUserStore.getState().user;

  const messagesRef = collection(
    db,
    "users",
    user.uid,
    "chats",
    chat.id,
    "messages"
  );

  const q = query(messagesRef, orderBy("updated_at", "asc"));
  const snapshot = await getDocs(q);

  const messages = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      created_at: data.created_at?.toDate?.(),
      updated_at: data.updated_at?.toDate?.(),
    };
  });

  return messages;
};

export const getMessagesForChatAPI = async (chat) => {
  try {
    const [chatData, messages] = await Promise.all([
      getChatAPI(chat),
      getMessagesAPI(chat),
    ]);

    return {
      chat: chatData,
      messages,
    };
  } catch (error) {
    return {
      chat: null,
      messages: [],
      error,
    };
  }
};
