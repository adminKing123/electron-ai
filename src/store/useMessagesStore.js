import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { deleteMessageAPI } from "../apis/messages/queryFunctions";
import { immer } from "zustand/middleware/immer";
import usePromptStore from "./usePromptStores";
import useMainSideLayoutStore from "./useMainSideLayoutStore";
import { stopGeneration } from "../apis/prompt_generation/generationControl";

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
    setActionRequestDecision: (message_id, action_index, decision) => {
      set((state) => {
        const message = state.data[message_id];
        if (!message?.interrupt?.value?.action_requests?.[action_index]) return;

        message.interrupt.value.action_requests[action_index].decision =
          decision;
      });
      const message = get().data[message_id];
      const requests = message.interrupt?.value?.action_requests || [];
      return requests.map((req) => ({ type: req.decision || null }));
    },
    deleteMessage: (message_id, id) => {
      set((state) => {
        state.messages = state.messages.filter((msg) => msg !== message_id);
        delete state.data[message_id];
      });
      const mainSideLayoutStoreData = useMainSideLayoutStore.getState().data;
      if (mainSideLayoutStoreData?.message_id === message_id)
        useMainSideLayoutStore.getState().setData(null);
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
          if (window.innerWidth >= 1024)
            useMainSideLayoutStore.getState().setData({
              type: "sources",
              payload: {
                message_id: id,
                sources: state.data[id].sources,
              },
            });
        } else if (eventtype === "duration") {
          state.data[id].duration = eventdata.seconds;
        } else if (eventtype === "file") {
          state.data[id].answer_files = state.data[id].answer_files.concat([
            eventdata,
          ]);
        } else if (eventtype === "interrupt") {
          state.data[id].interrupt = eventdata;
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
      useProcessController.getState().setProcess(null, null, false);
      usePromptStore.getState().setAction({});
      useMainSideLayoutStore.getState().setData(null);
    },
  }))
);

export const useProcessController = create(
  immer((set, get) => ({
    process: null,
    message_process: {},
    controller: null,
    setProcess: (process = null, controller = null, shouldStop = false) => {
      const currentProcess = get().process;
      const messageIdToStop = shouldStop && currentProcess?.messageId ? currentProcess.messageId : null;
      const controllerToAbort = shouldStop ? get().controller : null;
      
      set((state) => {
        if (process?.id) {
          state.message_process[process?.id] = process;
        } else {
          state.message_process = {};
        }
        state.process = process;
        state.controller = controller;
      });
      
      if (messageIdToStop) {
        stopGeneration(messageIdToStop).catch((err) => {
          console.error("Failed to stop generation:", err);
        });
      }
      
      if (controllerToAbort) {
        controllerToAbort.abort();
      }
    },
  }))
);

export default useMessageStore;
