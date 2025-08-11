import {
  setDoc,
  doc,
  getDocs,
  collection,
  orderBy,
  query,
  limit,
  startAfter,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import api from "..";
import { db } from "../../firebase";
import useUserStore from "../../store/useUserStore";
import ENDPOINTS from "../endpoints";

export const summariseChatTitleAPI = async (data) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.SUMMARISE_CHAT_TITLE,
    data: {
      prompt: data.prompt_to_summerize_title,
    },
  });
  return response.data;
};

export const createChatAPI = async (data) => {
  const user = useUserStore.getState().user;
  const payload = {
    id: data.id,
    title: data.title,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  const docRef = doc(db, "users", user.uid, "chats", data.id);
  await setDoc(docRef, payload);

  return {
    ...payload,
    docRef,
  };
};

export const getChatsAPI = async (pageParam = null) => {
  const user = useUserStore.getState().user;
  const chatsRef = collection(db, "users", user.uid, "chats");
  const pageSize = 30;

  let q = query(chatsRef, orderBy("updated_at", "desc"), limit(pageSize));

  if (pageParam) {
    q = query(
      chatsRef,
      orderBy("updated_at", "desc"),
      startAfter(pageParam),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);

  const chats = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      docRef: doc,
      updated_at: data.updated_at?.toDate(),
      created_at: data.created_at?.toDate(),
    };
  });

  return chats;
};

export const getChatAPI = async (chat) => {
  const user = useUserStore.getState().user;

  const chatDocRef = doc(db, "users", user.uid, "chats", chat.id);
  const chatDoc = await getDoc(chatDocRef);

  if (!chatDoc.exists()) return {};

  const data = chatDoc.data();

  return {
    id: chatDoc.id,
    ...data,
    docRef: chatDoc,
    updated_at: data.updated_at?.toDate?.(),
    created_at: data.created_at?.toDate?.(),
  };
};

export const deleteChatAPI = async (chatId) => {
  const user = useUserStore.getState().user;

  const chatDocRef = doc(db, "users", user.uid, "chats", chatId);
  await deleteDoc(chatDocRef);

  return { id: chatId, deleted: true };
};
