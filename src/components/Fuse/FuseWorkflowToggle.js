import { useState } from "react";
import { activateWorkflowAPI, deactivateWorkflowAPI } from "../../apis/fuse/queryFunctions";

/**
 * FuseWorkflowToggle — single button that activates or deactivates a workflow.
 *
 * Calls the appropriate API based on the current `isActive` state, shows inline
 * loading text during the request, then calls `onDone()` on success.
 *
 * @param {string}   workflowId  — ID of the workflow to toggle
 * @param {boolean}  isActive    — current activation status from the workflow doc
 * @param {Function} onDone      — called after the API resolves successfully
 */
const FuseWorkflowToggle = ({ workflowId, isActive, onDone }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e?.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (isActive) {
        await deactivateWorkflowAPI(workflowId);
      } else {
        await activateWorkflowAPI(workflowId);
      }
      onDone();
    } catch {
      setLoading(false);
    }
  };

  return isActive ? (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="px-4 py-1.5 rounded-full text-[12px] font-semibold select-none
        bg-red-100 dark:bg-red-900/30
        text-red-600 dark:text-red-400
        hover:bg-red-200 dark:hover:bg-red-800/50
        active:opacity-80 transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Turning Off…" : "Turn Off"}
    </button>
  ) : (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="px-4 py-1.5 rounded-full text-[12px] font-semibold select-none
        bg-emerald-100 dark:bg-emerald-900/30
        text-emerald-700 dark:text-emerald-400
        hover:bg-emerald-200 dark:hover:bg-emerald-800/50
        active:opacity-80 transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Turning On…" : "Turn On"}
    </button>
  );
};

export default FuseWorkflowToggle;
