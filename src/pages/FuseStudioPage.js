import React, { useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  FuseStudioHeader,
  CanvasActionBar,
  FuseStudioSidebar,
  WorkflowCanvas,
  NodeConfigPanel,
} from "../components/Fuse";
import {
  getWorkflowByIdAPI,
  updateWorkflowNameAPI,
  updateWorkflowGraphAPI,
  getStarterNodesAPI,
  getActionNodesAPI,
  activateWorkflowAPI,
  deactivateWorkflowAPI,
} from "../apis/fuse/queryFunctions";
import CONFIG from "../config";
import useCreateWorkflow from "../hooks/useCreateWorkflow";
import useFuseStudioStore from "../store/useFuseStudioStore";

/**
 * FuseStudioPage — the workflow builder canvas.
 *
 * All observable graph state lives in useFuseStudioStore.
 * This page owns the async API calls and wires them into the store.
 *
 * Execution flow
 * ──────────────
 * Turn On  → activateWorkflowAPI  → backend compiles + starts execution
 * Turn Off → deactivateWorkflowAPI → backend stops execution
 * Recompile (Save Changes) → same as Turn On (activate endpoint handles it)
 *
 * Graph auto-save
 * ───────────────
 * Debounced 1.5 s after every graph change.  Skipped during initial hydration.
 * Auto-save does NOT recompile — the running execution is NOT updated.
 */
export default function FuseStudioPage() {
  const { id } = useParams();

  // ── Store reads ──────────────────────────────────────────────────────────
  const workflowName  = useFuseStudioStore((s) => s.workflowName);
  const loading       = useFuseStudioStore((s) => s.loading);
  const saving        = useFuseStudioStore((s) => s.saving);
  const storeWorkflow = useFuseStudioStore((s) => s.workflow);
  const nodes         = useFuseStudioStore((s) => s.nodes);
  const edges         = useFuseStudioStore((s) => s.edges);
  const compilationErrors = useFuseStudioStore((s) => s.compilationErrors);
  const activating    = useFuseStudioStore((s) => s.activating);
  const deactivating  = useFuseStudioStore((s) => s.deactivating);

  // Enable header buttons only once a starter (trigger) node is on the canvas
  const hasStarterNode = nodes.some((n) => n.data?.isStarter === true);

  // Derive the workflow active status and webhook URL from store state
  const isActive = storeWorkflow?.status === "active";

  // ── Store actions ────────────────────────────────────────────────────────
  const setWorkflow           = useFuseStudioStore((s) => s.setWorkflow);
  const setWorkflowName       = useFuseStudioStore((s) => s.setWorkflowName);
  const setLoading            = useFuseStudioStore((s) => s.setLoading);
  const setSaving             = useFuseStudioStore((s) => s.setSaving);
  const setStarterNodes       = useFuseStudioStore((s) => s.setStarterNodes);
  const setLoadingNodes       = useFuseStudioStore((s) => s.setLoadingNodes);
  const setActionNodes        = useFuseStudioStore((s) => s.setActionNodes);
  const setLoadingActionNodes = useFuseStudioStore((s) => s.setLoadingActionNodes);
  const setAddingNode         = useFuseStudioStore((s) => s.setAddingNode);
  const setNodes              = useFuseStudioStore((s) => s.setNodes);
  const setEdges              = useFuseStudioStore((s) => s.setEdges);
  const resetStudio           = useFuseStudioStore((s) => s.resetStudio);
  const setActivationSuccess  = useFuseStudioStore((s) => s.setActivationSuccess);
  const setCompilationErrors  = useFuseStudioStore((s) => s.setCompilationErrors);
  const setActivating         = useFuseStudioStore((s) => s.setActivating);
  const setDeactivating       = useFuseStudioStore((s) => s.setDeactivating);
  const initCompilationState  = useFuseStudioStore((s) => s.initCompilationState);
  const clearCompilation      = useFuseStudioStore((s) => s.clearCompilation);

  // Not observable state — mutable anchor to compare against for name autosave
  const committedNameRef = useRef("");

  // ── Load workflow + node definitions ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    getWorkflowByIdAPI(id)
      .then((wf) => {
        if (cancelled) return;
        const name = wf.name ?? "Untitled Workflow";
        setWorkflowName(name);
        committedNameRef.current = name;
        setWorkflow(wf);
        setNodes(wf.nodes ?? []);
        setEdges(wf.edges ?? []);
        // Initialise compilation state so the header shows the correct status
        // and the dirty-graph indicator is accurate on first load.
        initCompilationState({
          compiledAt: wf.compiled_at ?? null,
        });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    setLoadingNodes(true);
    getStarterNodesAPI()
      .then((nodes) => { if (!cancelled) setStarterNodes(nodes); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingNodes(false); });

    setLoadingActionNodes(true);
    getActionNodesAPI()
      .then((nodes) => { if (!cancelled) setActionNodes(nodes); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingActionNodes(false); });

    return () => {
      cancelled = true;
      resetStudio();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Auto-save graph (debounced 1.5 s) ───────────────────────────────────
  // Updates the DB record but does NOT recompile the running execution.
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (loading || !storeWorkflow) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateWorkflowGraphAPI(id, nodes, edges).catch(() => {});
    }, 1500);
    return () => clearTimeout(saveTimerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  // ── Name autosave on blur ────────────────────────────────────────────────
  const handleNameBlur = async () => {
    const trimmed = workflowName.trim() || "Untitled Workflow";
    if (!workflowName.trim()) setWorkflowName("Untitled Workflow");
    if (trimmed === committedNameRef.current) return;

    setSaving(true);
    try {
      await updateWorkflowNameAPI(id, trimmed);
      committedNameRef.current = trimmed;
      if (storeWorkflow) setWorkflow({ ...storeWorkflow, name: trimmed });
    } catch {
      setWorkflowName(committedNameRef.current);
    } finally {
      setSaving(false);
    }
  };

  // ── Activate (Turn On / Recompile) ──────────────────────────────────────
  const handleActivate = useCallback(async () => {
    setActivating(true);
    try {
      const result = await activateWorkflowAPI(id);
      // Update the workflow in the store so the status pill switches immediately
      if (result.workflow) setWorkflow(result.workflow);
      setActivationSuccess({ compiledAt: result.compiled_at });
    } catch (err) {
      // Backend returns { success: false, errors: [...] } on validation failure
      const errData = err?.response?.data;
      const errors  = errData?.errors ?? [errData?.error ?? "Compilation failed. Please try again."];
      setCompilationErrors(errors);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Deactivate (Turn Off) ───────────────────────────────────────────────
  const handleDeactivate = useCallback(async () => {
    setDeactivating(true);
    try {
      const result = await deactivateWorkflowAPI(id);
      if (result.workflow) setWorkflow(result.workflow);
      clearCompilation();
    } catch {
      // Optimistically clear deactivating flag; workflow remains active
      setDeactivating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const { creating, handleCreate } = useCreateWorkflow();

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
      <FuseStudioHeader
        name={loading ? "" : workflowName}
        workflowId={id}
        onNameChange={setWorkflowName}
        onNameBlur={handleNameBlur}
        saving={saving}
        isLoading={loading}
      />

      <div className="flex-1 flex overflow-hidden">
        <FuseStudioSidebar creating={creating} onCreate={handleCreate} />
        <div
          className="relative flex-1 flex gap-2.5 rounded-xl p-4 mb-3 mr-3
            bg-[#f7f7f7] dark:bg-[#1a1a1a]
            border border-[#e5e5e5] dark:border-[#252525]
            shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]"
        >
          {/* Canvas — relative container so CanvasActionBar centers within it only */}
          <div className="relative flex-1 min-w-0">
            <WorkflowCanvas className="h-full" />
            <CanvasActionBar
              hasNodes={hasStarterNode}
              isActive={isActive}
              activating={activating}
              deactivating={deactivating}
              compilationErrors={compilationErrors}
              onAddNode={() => setAddingNode(true)}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
            />
          </div>
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
