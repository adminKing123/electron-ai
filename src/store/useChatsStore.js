import { create } from "zustand";
import { summariseChatTitleAPI } from "../apis/chats/queryFunctions";

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
  summerizeChatTitle: (chatToSummarize) => {
    summariseChatTitleAPI({
      prompt_to_summerize_title:
        chatToSummarize.summarization_data.prompt_to_summerize_title,
      message_id: chatToSummarize.summarization_data.message_id,
      chat_id: chatToSummarize.id,
    })
      .then((response) => {
        get().updateChat(chatToSummarize.id, {
          title: response.title,
          is_new: false,
          summarization_data: null,
        });
      })
      .catch((error) => {
        get().updateChat(chatToSummarize.id, {
          title: chatToSummarize.summarization_data.prompt_to_summerize_title,
          is_new: false,
          summarization_data: null,
        });
      });
  },
}));

export default useChatsStore;
