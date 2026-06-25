import { create } from "zustand";

const useIntegrationInfoModalStore = create((set) => ({
  isOpen: false,
  integrationId: null,
  openModal: (integrationId) => set({ isOpen: true, integrationId }),
  closeModal: () => set({ isOpen: false, integrationId: null }),
}));

export default useIntegrationInfoModalStore;