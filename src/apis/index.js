import axios from "axios";
import { QueryClient, QueryClientProvider } from "react-query";
import CONFIG from "../config";
import useUserStore from "../store/useUserStore";

export const baseURL = CONFIG.API_BASE_URL;

const api = (config) => {
  const axiosInstance = axios.create({
    baseURL: baseURL,
  });

  axiosInstance.interceptors.request.use(
    async (config) => {
      const user = useUserStore.getState().user;
      if (user) {
        const freshToken = await user.getIdToken(true);
        config.headers.Authorization = `Bearer ${freshToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return axiosInstance(config);
};

export const ApiProvider = ({ children }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default api;
