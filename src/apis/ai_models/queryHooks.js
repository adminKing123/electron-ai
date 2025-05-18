import { useQuery } from "react-query";
import QUERYKEYS from "../queryKeys";
import { getAIModels } from "./queryFunctions";

export const useGetAIModels = (config = {}) =>
  useQuery({
    queryKey: [QUERYKEYS.GET_MODELS],
    queryFn: getAIModels,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...config,
  });
