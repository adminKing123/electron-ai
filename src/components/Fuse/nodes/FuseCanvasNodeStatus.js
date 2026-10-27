import React from "react";
import { TbCheck, TbMinus, TbX } from "react-icons/tb";

const BADGE = {
  success: {
    Icon: TbCheck,
    shell: "bg-emerald-500 text-white border-emerald-600/30 dark:border-emerald-400/40",
  },
  error: {
    Icon: TbX,
    shell: "bg-red-500 text-white border-red-600/30 dark:border-red-400/40",
  },
  skipped: {
    Icon: TbMinus,
    shell: "bg-ink-400 dark:bg-ink-600 text-white border-ink-300/40",
  },
};

/** n8n-style corner status mark (success / failed / skipped). */
const FuseCanvasNodeStatus = ({ runStatus }) => {
  if (!runStatus || runStatus === "running") return null;
  const cfg = BADGE[runStatus];
  if (!cfg) return null;
  const { Icon, shell } = cfg;

  return (
    <span
      className={`pointer-events-none absolute bottom-1.5 left-1.5 z-[20] flex items-center justify-center
        w-[18px] h-[18px] rounded-full border shadow-sm ${shell}`}
      aria-hidden
    >
      <Icon className="w-3 h-3" strokeWidth={2.5} />
    </span>
  );
};

export default FuseCanvasNodeStatus;
