import { create } from "zustand";

const usePromptStore = create((set) => ({
  prompt: "",
  setPrompt: (value) => set({ prompt: value }),

  action: {},
  setAction: (value) => set({ action: value }),
}));

export const useModelStore = create((set) => ({
  model: null,
  setModel: (value) => set({ model: value }),
}));

export const useWebSearchStore = create((set) => ({
  isWebSearchOn: false,
  setIsWebSearchOn: (value) => set({ isWebSearchOn: value }),
  isWebSearchDisabled: true,
  setIsWebSearchDisabled: (value) => set({ isWebSearchDisabled: value }),
}));

export const useDeepResearchStore = create((set) => ({
  isDeepResearch: false,
  setIsDeepResearch: (value) => set({ isDeepResearch: value }),
}));

export default usePromptStore;
