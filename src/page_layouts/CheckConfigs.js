import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import useUserStore from "../store/useUserStore";
import { getConfigAPI } from "../apis/get_config/queryFunctions";
import { useModelStore } from "../store/usePromptStores";

const CheckConfigs = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await useUserStore.getState().setUser(currentUser);
        getConfigAPI({
          successCallback: (configData) => {
            useModelStore.getState().setAITypes(configData.AI_TYPES || []);
            useModelStore.getState().setAIModels(configData.AI_MODELS || {});
            useModelStore
              .getState()
              .setDefaultAIType(configData.AI_DEFAULT_TYPE || null);
          },
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;
  return <Outlet />;
};

export default CheckConfigs;
