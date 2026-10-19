import React from "react";
import { BiError } from "react-icons/bi";

export default function ErrorState({ errorMessage, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
          <BiError className="text-5xl text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Radio Error
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {errorMessage || "An error occurred while playing the radio"}
        </p>
      </div>

      <button
        onClick={onRetry}
        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
      >
        Retry
      </button>
    </div>
  );
}
