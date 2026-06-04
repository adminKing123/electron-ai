import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FuseStudioHeader } from "../components/Fuse";
import {
  getWorkflowByIdAPI,
  updateWorkflowNameAPI,
} from "../apis/fuse/queryFunctions";

/**
 * FuseStudioPage — the workflow builder canvas.
 *
 * Accessed via /fuse/studio/:id after creating or editing a workflow.
 * Loads the workflow name for the editable header; canvas implementation is pending.
 */
export default function FuseStudioPage() {
  const { id } = useParams();

  const [workflowName, setWorkflowName] = useState("");
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);

  // Keep a ref to the committed name so we can revert on blur if unchanged
  const committedName = useRef("");

  /* Load the workflow on mount */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getWorkflowByIdAPI(id)
      .then((wf) => {
        if (cancelled) return;
        const name = wf.name ?? "Untitled Workflow";
        setWorkflowName(name);
        committedName.current = name;
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  /* Save the name on blur — only if it actually changed */
  const handleNameBlur = useCallback(async () => {
    const trimmed = workflowName.trim() || "Untitled Workflow";

    // Normalize empty input back to placeholder text
    if (!workflowName.trim()) setWorkflowName("Untitled Workflow");

    // Skip API call if nothing changed
    if (trimmed === committedName.current) return;

    setSaving(true);
    try {
      await updateWorkflowNameAPI(id, trimmed);
      committedName.current = trimmed;
    } catch {
      /* Revert to last committed name on failure */
      setWorkflowName(committedName.current);
    } finally {
      setSaving(false);
    }
  }, [id, workflowName]);

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
      {/* ── Studio header with editable workflow name ── */}
      <FuseStudioHeader
        name={loading ? "" : workflowName}
        onNameChange={setWorkflowName}
        onNameBlur={handleNameBlur}
        saving={saving}
      />

      {/* ── Canvas placeholder ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 select-none">
        {loading ? (
          <div className="w-32 h-4 rounded-md bg-[#f0f0f0] dark:bg-[#2a2a2a] animate-pulse" />
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-black dark:text-white tracking-tight">
              Fuse Studio
            </h1>
            <p className="text-xs text-[#aaa] dark:text-[#555]">
              Workflow&nbsp;
              <span className="font-mono text-[#888] dark:text-[#666]">{id}</span>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
