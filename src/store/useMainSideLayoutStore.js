import { create } from "zustand";
import { useSidebarOpenState } from "./useSidebarStores";

const useMainSideLayoutStore = create((set, get) => ({
  data: {
    type: null,
  },
  setData: (payload) => {
    if (payload) {
      if (payload.type === "editor")
        useSidebarOpenState.getState().setOpen(false);
      set({ data: payload });
    } else set({ data: { ...get().data, type: null } });
  },
}));

export default useMainSideLayoutStore;
