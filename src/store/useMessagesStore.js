import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { deleteMessageAPI } from "../apis/messages/queryFunctions";
import { immer } from "zustand/middleware/immer";

const useMessageStore = create(
  immer((set) => ({
    messages: [],
    data: {},
    addMessage: (message) => {
      const id = uuidv4();
      set((state) => {
        state.messages.push(id);
        state.data[id] = {
          id,
          ...message,
        };
      });
      return id;
    },
    deleteMessage: (message_id, id) => {
      set((state) => {
        state.messages = state.messages.filter((msg) => msg !== message_id);
        delete state.data[message_id];
      });
      deleteMessageAPI({
        message_id,
        chat_id: id,
      });
    },
    addChunkInMessageAnswer: (id, chunk) => {
      set((state) => {
        state.data[id].answer = (state.data[id].answer || "") + chunk;
      });
    },
    resetMessages: () => {
      set(() => ({
        messages: [],
        data: {},
      }));
      useProcessController.getState().setProcess(null, null);
    },
  }))
);

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
