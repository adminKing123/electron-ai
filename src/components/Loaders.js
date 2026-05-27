/** Tiny spinner used inline inside buttons and tight spaces */
const Spinner = ({ className = "w-3 h-3" }) => (
  <div
    className={`${className} border-2 border-t-transparent border-current rounded-full animate-spin`}
  />
);

export const GettingStartedLoader = () => {
  return (
    <div className="flex items-center gap-2 text-[#888] dark:text-[#555]">
      <Spinner />
      <span className="text-[12px]">Getting started…</span>
    </div>
  );
};

export const LoadingMessages = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 py-16 text-[#bbb] dark:text-[#3a3a3a]">
      <Spinner className="w-4 h-4" />
    </div>
  );
};

export const BasicLoader = () => {
  return (
    <div className="flex items-center justify-center text-current">
      <Spinner />
    </div>
  );
};
