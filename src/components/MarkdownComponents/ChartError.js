import { IoStatsChart } from "react-icons/io5";

const ChartError = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
      <IoStatsChart className="text-4xl text-gray-500 dark:text-gray-300" />
      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Couldn't Generate Chart
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
        The data provided was incomplete or invalid for chart rendering.
      </div>
    </div>
  );
};

export default ChartError;
