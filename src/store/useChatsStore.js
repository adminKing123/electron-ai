import { create } from "zustand";

const useChatsStore = create((set) => ({
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
}));

export default useChatsStore;
