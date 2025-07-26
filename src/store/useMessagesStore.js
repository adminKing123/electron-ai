import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { deleteMessageAPI } from "../apis/messages/queryFunctions";
import { immer } from "zustand/middleware/immer";
import usePromptStore from "./usePromptStores";

const useMessageStore = create(
  immer((set, get) => ({
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
    setMessage: (id, message) => {
      set((state) => {
        state.data[id] = {
          id,
          ...message,
        };
      });
      return id;
    },
    getMessage: (id) => {
      return get().data[id];
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
    addChunkInMessageAnswer: (id, event) => {
      set((state) => {
        const eventtype = event.type;
        const { data: eventdata, id: eventid, index } = event.data;
        if (eventtype === "text") {
          if (state.data[id].answer[index]) {
            state.data[id].answer[index].data += eventdata || "";
          } else {
            state.data[id].answer[index] = {
              id: eventid,
              type: "text",
              data: eventdata || "",
            };
          }
        } else if (eventtype === "step") {
          state.data[id].steps = state.data[id].steps.concat(eventdata);
        } else if (eventtype === "source") {
          state.data[id].sources = state.data[id].sources.concat(eventdata);
        } else {
          state.data[id].answer[index] = {
            id: eventid,
            type: eventtype,
            data: eventdata,
          };
        }
      });
    },
    resetMessages: () => {
      set(() => ({
        messages: [],
        data: {},
      }));
      useProcessController.getState().setProcess(null, null, true);
      usePromptStore.getState().setAction({});
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
