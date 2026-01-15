import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  // setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { getChatAPI } from "../chats/queryFunctions";

export const deleteMessageAPI = async (data) => {
  const docRef = doc(
    db,
    "chats",
    data.chat_id,
    "messages",
    data.message_id
  );

  await deleteDoc(docRef);

  return {
    success: true,
  };
};

// export const createMessageAPI = async (chat, message) => {
  // console.log(message)
  // const docRef = doc(
  //   db,
  //   "chats",
  //   chat.id,
  //   "messages",
  //   message.id
  // );
  
  // await setDoc(docRef, message);

  // return {
  //   ...message,
  //   docRef,
  // };
// };

export const getMessagesAPI = async (chat) => {
  const messagesRef = collection(
    db,
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
