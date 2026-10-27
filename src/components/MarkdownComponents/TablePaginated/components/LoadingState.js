import { BasicLoader } from "../../../Loaders";

const LoadingState = () => {
  return (
    <div className="flex items-center justify-center gap-2 py-8 min-h-[120px] text-[13px] text-ink-400 dark:text-ink-550">
      <BasicLoader /> Loading data...
    </div>
  );
};

export default LoadingState;
