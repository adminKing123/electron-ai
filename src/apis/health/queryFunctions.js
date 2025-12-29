import CONFIG from "../../config";

export const checkServerHealth = async () => {
  const response = await fetch(`${CONFIG.API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error("Server not ready");
  }
  return response.json();
};
