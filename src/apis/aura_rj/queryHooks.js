import { useMutation } from "react-query";
import { getTrackAPI } from "./queryFunctions";

export const useGetTrack = () => {
  return useMutation(getTrackAPI);
};
