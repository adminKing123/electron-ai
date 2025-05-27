import { create } from "zustand";

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
    get().updateChat(chatToSummarize.id, {
      title: chatToSummarize.prompt_to_summerize_title || "New Chat",
      is_new: false,
      prompt_to_summerize_title: null,
    });
  },
}));

export default useChatsStore;
