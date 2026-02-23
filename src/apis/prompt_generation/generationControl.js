import useUserStore from "../../store/useUserStore";
import ENDPOINTS from "../endpoints";

const getAuthHeaders = async () => {
  const user = useUserStore.getState().user;
  const token = user?.getIdToken ? await user.getIdToken() : null;
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const stopGeneration = async (messageId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(ENDPOINTS.GET_STOP_GENERATION_URL(messageId), {
      method: "POST",
      headers,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to stop generation:", error);
    return {
      success: false,
      message: error.message || "Failed to stop generation",
    };
  }
};
