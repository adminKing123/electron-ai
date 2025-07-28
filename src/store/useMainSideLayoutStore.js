import { create } from "zustand";

const useMainSideLayoutStore = create((set, get) => ({
  data: null,
  setData: (data) => set({ data }),
}));

export default useMainSideLayoutStore;
