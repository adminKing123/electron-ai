import { BasicLoader } from "../../../Loaders";

const LoadingState = () => {
  return (
    <div className="flex items-center justify-center py-8 min-h-[320px]">
        <BasicLoader /> Loading data...
    </div>
  );
};

export default LoadingState;
