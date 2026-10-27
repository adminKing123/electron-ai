import { TbBolt } from "react-icons/tb";

const WorkflowEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center select-none">
    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
      <TbBolt className="w-6 h-6 text-brand-600 dark:text-brand-400" />
    </div>
    <p className="text-[15px] font-semibold text-ink-975 dark:text-white">
      No fuses yet
    </p>
    <p className="text-[13px] text-ink-500 dark:text-ink-500 mt-1 max-w-xs">
      Click{" "}
      <span className="font-semibold text-ink-875 dark:text-ink-100">Create New</span>{" "}
      to build your first automation.
    </p>
  </div>
);

export default WorkflowEmptyState;
