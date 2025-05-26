import { create } from "zustand";
import CONFIG from "../config";

const useUserStore = create((set) => ({
  DEFAULT_USER: CONFIG.DEFAULT_USER,
  user: null,
  setUser: (value) => {
    set({ user: value });
  },
}));

export default useUserStore;
