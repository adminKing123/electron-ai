import CONFIG from "../../config";

export const checkServerHealth = async (onProgress) => {
  const apiPromise = (async () => {
    onProgress("api", "checking");
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/health`);
      if (!response.ok) throw new Error("API Server not ready");
      const data = await response.json();
      onProgress("api", "success");
      return { success: true, data };
    } catch (error) {
      onProgress("api", "error");
      return { success: false, error: error.message };
    }
  })();

  const cdnPromise = (async () => {
    onProgress("cdn", "checking");
    try {
      const response = await fetch(`${CONFIG.FILE_CDN_URL}/health`);
      if (!response.ok) throw new Error("CDN Server not ready");
      const data = await response.json();
      onProgress("cdn", "success");
      return { success: true, data };
    } catch (error) {
      onProgress("cdn", "error");
      return { success: false, error: error.message };
    }
  })();

  const [apiResult, cdnResult] = await Promise.all([apiPromise, cdnPromise]);

  if (!apiResult.success || !cdnResult.success) {
    throw new Error("One or more servers are not ready");
  }

  return {
    api: apiResult.data,
    cdn: cdnResult.data,
    status: "healthy",
  };
};
