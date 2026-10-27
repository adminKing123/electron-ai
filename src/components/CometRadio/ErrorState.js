import React from "react";
import { BiError } from "react-icons/bi";

export default function ErrorState({ errorMessage, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
          <BiError className="text-5xl text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold text-ink-800 dark:text-ink-150">
          Radio Error
        </h2>
        <p className="text-ink-650 dark:text-ink-400 text-center max-w-md">
          {errorMessage || "An error occurred while playing the radio"}
        </p>
      </div>

      <button
        onClick={onRetry}
        className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
      >
        Retry
      </button>
    </div>
  );
}
