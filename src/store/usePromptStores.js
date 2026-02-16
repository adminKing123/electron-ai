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

  type: null,
  setType: (value) => set({ type: value }),

  defaultAIType: null,
  setDefaultAIType: (value) => set({ defaultAIType: value }),

  AI_TYPES: [],
  setAITypes: (value) => set({ AI_TYPES: value }),

  AI_MODELS: {},
  setAIModels: (value) => set({ AI_MODELS: value }),
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

export const useFileInputStore = create((set) => ({
  attachedFiles: {},
  addFiles: (files) => {
    set((state) => {
      const attachedFiles = state.attachedFiles;
      const newFiles = { ...attachedFiles };
      files.forEach((fileObj) => {
        newFiles[fileObj.id] = { ...fileObj };
      });
      return { attachedFiles: newFiles };
    });
  },
  addFile: (fileObj) => {
    set((state) => {
      const attachedFiles = state.attachedFiles;
      const newFiles = { ...attachedFiles };
      newFiles[fileObj.id] = { ...fileObj };
      return { attachedFiles: newFiles };
    });
  },
  removeFile: (id) => {
    set((state) => {
      const attachedFiles = state.attachedFiles;
      const newFiles = { ...attachedFiles };
      delete newFiles[id];
      return { attachedFiles: newFiles };
    });
  },
  updateFile: (id, updatedProps) => {
    set((state) => {
      const attachedFiles = state.attachedFiles;
      const newFiles = { ...attachedFiles };
      if (newFiles[id]) {
        newFiles[id] = { ...newFiles[id], ...updatedProps };
      }
      return { attachedFiles: newFiles };
    });
  },
  clearFiles: () => set({ attachedFiles: {} }),
}));

export const useMicStore = create((set) => ({
  isRecording: false,
  setIsRecording: (value) => set({ isRecording: value }),
  recordedText: "",
  setRecordedText: (value) => set({ recordedText: value }),
}));

export default usePromptStore;
