import { create } from "zustand";
import { persist } from "zustand/middleware";

const useConnectedAppsStore = create(
  persist(
    (set) => ({
      connectedApps: {},
      
      setAppConnected: (appId, data) =>
        set((state) => ({
          connectedApps: {
            ...state.connectedApps,
            [appId]: {
              isConnected: true,
              connectedAt: new Date().toISOString(),
              lastSync: new Date().toISOString(),
              ...data,
            },
          },
        })),
      
      setAppDisconnected: (appId) =>
        set((state) => {
          const newConnectedApps = { ...state.connectedApps };
          delete newConnectedApps[appId];
          return { connectedApps: newConnectedApps };
        }),
      
      updateAppData: (appId, data) =>
        set((state) => ({
          connectedApps: {
            ...state.connectedApps,
            [appId]: {
              ...state.connectedApps[appId],
              ...data,
              lastSync: new Date().toISOString(),
            },
          },
        })),
      
      resetConnectedApps: () => set({ connectedApps: {} }),
    }),
    {
      name: "connected-apps-storage",
    }
  )
);

export default useConnectedAppsStore;
