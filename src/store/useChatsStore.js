import { create } from "zustand";
import {
  createChatAPI,
  deleteChatAPI,
  renameChatAPI,
  summariseChatTitleAPI,
} from "../apis/chats/queryFunctions";

const useChatsStore = create((set, get) => ({
  chats: [],
  lastDoc: null,
  hasMore: true,
  isLoading: false,
  
  setChats: (newChats) => set((state) => ({ chats: newChats })),

  appendChats: (newChats) =>
    set((state) => ({ chats: [...state.chats, ...newChats] })),
  
  setLastDoc: (doc) => set({ lastDoc: doc }),
  
  setHasMore: (hasMore) => set({ hasMore }),
  
  setIsLoading: (isLoading) => set({ isLoading }),

  addChat: (newChat) =>
    set((state) => ({
      chats: [newChat, ...state.chats],
    })),

  deleteChat: (id) => {
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== id),
    }));
    deleteChatAPI(id);
  },
  
  renameChat: async (id, newTitle) => {
    try {
      await renameChatAPI(id, newTitle);
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === id ? { ...chat, title: newTitle, updated_at: new Date().toISOString() } : chat
        ),
      }));
    } catch (error) {
      console.error("Failed to rename chat:", error);
      throw error;
    }
  },

  updateChat: (id, updatedData) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === id ? { ...chat, ...updatedData } : chat
      ),
    })),
  summerizeChatTitle: (chatToSummarize, shouldCreateChat = false) => {
    let summerizedTitle =
      chatToSummarize.summarization_data.prompt_to_summerize_title.slice(0, 34);
    summariseChatTitleAPI({
      prompt_to_summerize_title:
        chatToSummarize.summarization_data.prompt_to_summerize_title,
    })
      .then((response) => {
        summerizedTitle = response.summarized_title;
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
