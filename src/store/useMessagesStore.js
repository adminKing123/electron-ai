import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { deleteMessageAPI } from "../apis/messages/queryFunctions";
import { immer } from "zustand/middleware/immer";

const useMessageStore = create(
  immer((set) => ({
    messages: [],
    data: {},
    setMessages: (newMessages) =>
      set((state) => {
        state.data = {};
        state.messages = newMessages.map((message) => {
          state.data[message.id] = message;
          return message.id;
        });
      }),
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
      useProcessController.getState().setProcess(null, null, true);
    },
  }))
);

export const useProcessController = create(
  immer((set) => ({
    process: null,
    message_process: {},
    controller: null,
    setProcess: (process = null, controller = null, shouldStop = false) => {
      set((state) => {
        if (process?.id) {
          state.message_process[process?.id] = process;
        } else {
          state.message_process = {};
        }
        if (shouldStop) state.controller?.abort();
        state.process = process;
        state.controller = controller;
      });
    },
  }))
);

export default useMessageStore;
