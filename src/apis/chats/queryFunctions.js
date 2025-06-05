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
} from "firebase/firestore";
import api from "..";
import { db } from "../../firebase";
import useUserStore from "../../store/useUserStore";
import ENDPOINTS from "../endpoints";

export const summariseChatTitleAPI = async (data) => {
  const STATIC_DATA = {
    chat_id: "6b3f0f40-ee89-4320-b787-1a00f623e8b5",
    org_id: "synapses",
    prompt_id: "e74d7cdf-fa32-459e-bd7c-8712d0ac63f8",
    user_id: "un2xqHu71cd6WWycTr1P6UE4PiJ2",
    url: `${process.env.REACT_APP_API_URL_2}${ENDPOINTS.SUMMARISE_CHAT_TITLE}`,
  };

  const response = await api({
    method: "POST",
    url: STATIC_DATA.url,
    data: {
      prompt: data.prompt_to_summerize_title,
      prompt_id: STATIC_DATA.prompt_id,
      chat_id: STATIC_DATA.chat_id,
      org_id: STATIC_DATA.org_id,
      user_id: STATIC_DATA.user_id,
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
