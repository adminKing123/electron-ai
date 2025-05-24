import { create } from "zustand";

export const useSidebarOpenState = create((set) => ({
  open: true,
  setOpen: (value) => {
    set({ open: value });
  },
}));
