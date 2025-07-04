export const GettingStartedLoader = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center">
        <div className="w-3 h-3 border-2 border-t-transparent border-black dark:border-t-transparent dark:border-white rounded-full animate-spin"></div>
      </div>
      <div className="text-black dark:text-white text-xs">Getting Started</div>
    </div>
  );
};

export const LoadingMessages = () => {
  return (
    <div className="my-4 flex items-center justify-center">
      <div className="flex items-center justify-center">
        <div className="w-3 h-3 border-2 border-t-transparent border-black dark:border-t-transparent dark:border-white rounded-full animate-spin"></div>
      </div>
    </div>
  );
};
