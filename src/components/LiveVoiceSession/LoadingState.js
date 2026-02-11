import { BasicLoader } from "../Loaders";
import { STATUS } from "../../hooks/useVoiceSession";

const LoadingState = ({ status }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <BasicLoader />
      <p className="text-[#666666] dark:text-[#aaa] text-sm">
        {status === STATUS.FETCHING_TOKEN
          ? "Fetching token..."
          : "Connecting to AI..."}
      </p>
    </div>
  );
};

export default LoadingState;
