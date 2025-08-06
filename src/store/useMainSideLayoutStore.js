import { create } from "zustand";

const useMainSideLayoutStore = create((set, get) => ({
  data: {
    type: null,
  },
  setData: (payload) => {
    if (payload) set({ data: payload });
    else set({ data: { ...get().data, type: null } });
  },
}));

export default useMainSideLayoutStore;
