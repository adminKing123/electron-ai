import { MdStop } from "react-icons/md";

const ErrorState = ({ errorMessage, onRetry }) => {
  return (
    <div className="flex flex-col items-center gap-6 p-8 max-w-md">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
        <MdStop className="w-8 h-8 text-red-500" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
          Connection Failed
        </h2>
        <p className="text-[#666666] dark:text-[#aaa] text-sm mb-6">
          {errorMessage || "Unable to start voice session"}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-[#f2f2f2] dark:bg-[#2c2c2c] hover:bg-[#EAEAEA] dark:hover:bg-[#3A3A3A] border border-gray-200 dark:border-[#2f2f2f] rounded-2xl text-black dark:text-white font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorState;
