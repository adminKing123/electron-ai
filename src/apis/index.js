import axios from "axios";
import { QueryClient, QueryClientProvider } from "react-query";
import CONFIG from "../config";

export const baseURL = CONFIG.API_BASE_URL;

const api = (config) => {
  const axiosInstance = axios.create({
    baseURL: baseURL,
  });

  return axiosInstance(config);
};

export const ApiProvider = ({ children }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default api;
