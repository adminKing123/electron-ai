import { create } from "zustand";

export const useSidebarOpenState = create((set) => ({
  open: window.innerWidth > 768,
  setOpen: (value) => {
    set({ open: value });
  },
}));
