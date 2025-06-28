import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,
  setUser: (value) => {
    set({ user: value });
  },
}));

export default useUserStore;
