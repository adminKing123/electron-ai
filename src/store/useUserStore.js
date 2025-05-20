import { create } from "zustand";
import CONFIG from "../config";

const useUserStore = create((set) => ({
  user: CONFIG.DEFAULT_USER,
  setUser: (value) => {
    set({ user: value });
  },
}));

export default useUserStore;
