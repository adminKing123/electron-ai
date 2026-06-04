import React from "react";
import useFuseStudioStore from "../../store/useFuseStudioStore";

const WorkflowCanvas = ({ className = "" }) => {
  const rawSteps  = useFuseStudioStore((s) => s.workflow?.steps);
  const steps     = rawSteps ?? [];
  const selectNode = useFuseStudioStore((s) => s.selectNode);

  if (steps.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 select-none ${className}`}
      >
        <div className="flex items-center gap-3 text-[#b0b0b0] dark:text-[#4a4a4a]">
          <div className="text-center">
            <p className="text-[14px] font-medium text-[#888] dark:text-[#555]">
              Pick a starter node
            </p>
            <p className="text-[12px] text-[#b0b0b0] dark:text-[#404040] mt-0.5">
              Choose a node from the right panel to begin your workflow
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-auto ${className}`}>
      {steps.map((step) => (
        <button
          key={step.id}
          onClick={() => selectNode(step)}
          className="block w-full text-left px-4 py-3 rounded-xl
            bg-white dark:bg-[#212121]
            border border-[#e5e5e5] dark:border-[#2a2a2a]
            shadow-sm hover:shadow-md transition-shadow
            text-[13px] text-[#222] dark:text-[#ddd] mb-2"
        >
          {step.label ?? step.type}
        </button>
      ))}
    </div>
  );
};

export default WorkflowCanvas;

