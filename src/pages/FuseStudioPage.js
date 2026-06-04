import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  FuseStudioHeader,
  FuseStudioSidebar,
  WorkflowCanvas,
  NodeConfigPanel,
} from "../components/Fuse";
import {
  getWorkflowByIdAPI,
  updateWorkflowNameAPI,
  getStarterNodesAPI,
} from "../apis/fuse/queryFunctions";
import useCreateWorkflow from "../hooks/useCreateWorkflow";
import useFuseStudioStore from "../store/useFuseStudioStore";

/**
 * FuseStudioPage — the workflow builder canvas.
 *
 * All observable state lives in useFuseStudioStore.
 * useRef is used only for committedNameRef — a mutable anchor (not observable state)
 * that tracks the last successfully saved name for blur-comparison and error revert.
 */
export default function FuseStudioPage() {
  const { id } = useParams();

  // ── Store reads ──────────────────────────────────────────────────────────
  const workflowName  = useFuseStudioStore((s) => s.workflowName);
  const loading       = useFuseStudioStore((s) => s.loading);
  const saving        = useFuseStudioStore((s) => s.saving);
  const storeWorkflow = useFuseStudioStore((s) => s.workflow);
  const starterNodes  = useFuseStudioStore((s) => s.starterNodes);

  // ── Store actions ────────────────────────────────────────────────────────
  const setWorkflow     = useFuseStudioStore((s) => s.setWorkflow);
  const setWorkflowName = useFuseStudioStore((s) => s.setWorkflowName);
  const setLoading      = useFuseStudioStore((s) => s.setLoading);
  const setSaving       = useFuseStudioStore((s) => s.setSaving);
  const setStarterNodes = useFuseStudioStore((s) => s.setStarterNodes);
  const setLoadingNodes = useFuseStudioStore((s) => s.setLoadingNodes);
  const resetStudio     = useFuseStudioStore((s) => s.resetStudio);

  // Not observable state — just a mutable comparison anchor
  const committedNameRef = useRef("");

  // ── Load workflow + starter nodes ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    // Fetch the workflow
    setLoading(true);
    getWorkflowByIdAPI(id)
      .then((wf) => {
        if (cancelled) return;
        const name = wf.name ?? "Untitled Workflow";
        setWorkflowName(name);
        committedNameRef.current = name;
        setWorkflow(wf);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    // Fetch starter node definitions — skip if already cached in the store
    if (starterNodes.length === 0) {
      setLoadingNodes(true);
      getStarterNodesAPI()
        .then((nodes) => { if (!cancelled) setStarterNodes(nodes); })
        .catch(() => {})
        .finally(() => { if (!cancelled) setLoadingNodes(false); });
    }

    return () => {
      cancelled = true;
      resetStudio(); // clear workflow state on unmount; starterNodes are preserved
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  // ↑ Intentionally omitting store actions (stable Zustand refs) and
  //   starterNodes (checking .length inside avoids re-triggering on load).

  // ── Save name on blur ────────────────────────────────────────────────────
  const handleNameBlur = async () => {
    const trimmed = workflowName.trim() || "Untitled Workflow";
    if (!workflowName.trim()) setWorkflowName("Untitled Workflow");
    if (trimmed === committedNameRef.current) return;

    setSaving(true);
    try {
      await updateWorkflowNameAPI(id, trimmed);
      committedNameRef.current = trimmed;
      // Sync the saved name back into the store's workflow object
      if (storeWorkflow) setWorkflow({ ...storeWorkflow, name: trimmed });
    } catch {
      // Revert input to last known-good name
      setWorkflowName(committedNameRef.current);
    } finally {
      setSaving(false);
    }
  };

  const { creating, handleCreate } = useCreateWorkflow();

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
      <FuseStudioHeader
        name={loading ? "" : workflowName}
        onNameChange={setWorkflowName}
        onNameBlur={handleNameBlur}
        saving={saving}
      />
      <div className="flex-1 flex overflow-hidden">
        <FuseStudioSidebar creating={creating} onCreate={handleCreate} />
        <div
          className="flex-1 flex gap-2.5 rounded-xl p-4 mb-3 mr-3
            bg-[#f7f7f7] dark:bg-[#1a1a1a]
            border border-[#e5e5e5] dark:border-[#252525]
            shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]"
        >
          {/* Left — node graph canvas */}
          <WorkflowCanvas className="flex-1" />

          {/* Right — starter node picker or selected node config */}
          <NodeConfigPanel
            className="flex-1 rounded-xl max-w-[550px]
              bg-white dark:bg-[#212121]
              border border-[#e5e5e5] dark:border-[#2a2a2a]
              shadow-sm overflow-hidden"
          />
        </div>
      </div>
    </main>
  );
}
