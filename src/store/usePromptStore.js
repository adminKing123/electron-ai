import { create } from "zustand";

const usePromptStore = create((set, get) => ({
  prompt: "",
  setPrompt: (value) => set({ prompt: value }),

  model: null,
  setModel: (value) => set({ model: value }),

  isWebSearchOn: false,
  setIsWebSearchOn: (value) => set({ isWebSearchOn: value }),

  isWebSearchDisabled: true,
  setIsWebSearchDisabled: (value) => set({ isWebSearchDisabled: value }),
}));

export default usePromptStore;
