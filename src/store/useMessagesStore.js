import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { deleteMessageAPI } from "../apis/messages/queryFunctions";

const useMessageStore = create((set) => ({
  messages: [],
  addMessage: (message) => {
    const id = uuidv4();
    set((state) => ({
      messages: [...state.messages, { id, ...message }],
    }));
    return id;
  },
  deleteMessage: (message_id, id) => {
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== message_id),
    }));
    deleteMessageAPI({
      message_id,
      chat_id: id,
    });
  },
  addChunkInMessageAnswer: (id, chunk) => {
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id === id && chunk) {
          const answer = (msg.answer || "") + chunk;
          return { ...msg, answer };
        }
        return msg;
      }),
    }));
  },
  resetMessages: () => {
    set(() => ({ messages: [] }));
    useProcessController.getState().setProcess(null, null);
  },
}));

export const useProcessController = create((set) => ({
  process: null,
  controller: null,
  setProcess: (process = null, controller = null) => {
    set((state) => {
      state.controller?.abort();
      return { process, controller };
    });
  },
}));

export default useMessageStore;
