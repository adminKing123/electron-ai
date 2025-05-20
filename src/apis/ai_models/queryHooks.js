import { useQuery } from "react-query";
import QUERYKEYS from "../queryKeys";
import { getAIModelsAPI } from "./queryFunctions";

export const useGetAIModelsAPI = (config = {}) =>
  useQuery({
    queryKey: [QUERYKEYS.GET_MODELS],
    queryFn: getAIModelsAPI,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...config,
  });
