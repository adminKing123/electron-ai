import { create } from "zustand";
import {
  createChatAPI,
  summariseChatTitleAPI,
} from "../apis/chats/queryFunctions";

const useChatsStore = create((set, get) => ({
  chats: [],

  addChat: (newChat) =>
    set((state) => ({
      chats: [newChat, ...state.chats],
    })),

  deleteChat: (id) =>
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== id),
    })),
  updateChat: (id, updatedData) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === id ? { ...chat, ...updatedData } : chat
      ),
    })),
  summerizeChatTitle: (chatToSummarize, shouldCreateChat = false) => {
    let summerizedTitle =
      chatToSummarize.summarization_data.prompt_to_summerize_title;
    summariseChatTitleAPI({
      prompt_to_summerize_title:
        chatToSummarize.summarization_data.prompt_to_summerize_title,
    })
      .then((response) => {
        summerizedTitle = response.summary_title;
        get().updateChat(chatToSummarize.id, {
          title: summerizedTitle,
          is_new: false,
          summarization_data: null,
        });
      })
      .catch((error) => {
        get().updateChat(chatToSummarize.id, {
          title: summerizedTitle,
          is_new: false,
          summarization_data: null,
        });
      })
      .finally(() => {
        if (shouldCreateChat)
          createChatAPI({
            ...chatToSummarize,
            title: summerizedTitle,
          });
      });
  },
}));

export default useChatsStore;
