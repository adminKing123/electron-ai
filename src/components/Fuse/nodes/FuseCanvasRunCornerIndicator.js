import React from "react";
import { TbCircleX } from "react-icons/tb";
import { BasicLoader } from "../../Loaders";

/**
 * Run-detail canvas — top-right mark: spinner while running, cross when failed.
 */
const FuseCanvasRunCornerIndicator = ({ runStatus }) => {
  if (runStatus === "running") {
    return (
      <span
        className="pointer-events-none absolute top-1.5 right-1.5 z-[25] text-brand-600 dark:text-brand-400"
        aria-label="Running"
      >
        <BasicLoader />
      </span>
    );
  }

  if (runStatus === "error") {
    return (
      <span
        className="pointer-events-none absolute top-1.5 right-1.5 z-[25] flex items-center justify-center text-red-500 dark:text-red-400"
        aria-label="Failed"
      >
        <TbCircleX className="w-6 h-6 flex-shrink-0" />
      </span>
    );
  }

  return null;
};

export default FuseCanvasRunCornerIndicator;
