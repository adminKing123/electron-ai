import { create } from "zustand";
import CONFIG from "../config";

const usePromptStore = create((set) => ({
  prompt: "",
  setPrompt: (value) => set({ prompt: value }),

  action: {},
  setAction: (value) => set({ action: value }),
}));

export const useModelStore = create((set) => ({
  model: null,
  setModel: (value) => set({ model: value }),

  type: CONFIG.AI_DEFAULT_TYPE,
  setType: (value) => set({ type: value }),

  defaultAIType: CONFIG.AI_DEFAULT_TYPE,
  setDefaultAIType: (value) => set({ defaultAIType: value }),
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
