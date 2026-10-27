import { IoStatsChart } from "react-icons/io5";

const ChartError = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
      <IoStatsChart className="text-4xl text-ink-550 dark:text-ink-200" />
      <div className="text-sm font-medium text-ink-725 dark:text-ink-150">
        Couldn't Generate Chart
      </div>
      <div className="text-xs text-ink-550 dark:text-ink-400 max-w-[200px]">
        The data provided was incomplete or invalid for chart rendering.
      </div>
    </div>
  );
};

export default ChartError;
