import { create } from "zustand";

const usePromptStore = create((set) => ({
  prompt: "",
  setPrompt: (value) => set({ prompt: value }),
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

export const useImageGenerateStore = create((set) => ({
  isImageGenerateOn: false,
  setIsImageGenerateOn: (value) => set({ isImageGenerateOn: value }),
}));

export default usePromptStore;
