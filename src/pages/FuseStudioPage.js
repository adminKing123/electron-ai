import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  TbSettings2, TbChevronDown,
  TbPlus, TbPower, TbRefresh,
} from "react-icons/tb";
import { useParams } from "react-router-dom";
import {
  FuseStudioHeader,
  CanvasActionBar,
  FuseStudioSidebar,
  WorkflowCanvas,
  NodeConfigPanel,
} from "../components/Fuse";
import MobileActionBar from "../components/Fuse/MobileActionBar";
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
 * --------------
 * Turn On  ? activateWorkflowAPI  ? backend compiles + starts execution
 * Turn Off ? deactivateWorkflowAPI ? backend stops execution
 * Recompile (Save Changes) ? same as Turn On (activate endpoint handles it)
 *
 * Graph auto-save
 * ---------------
 * Debounced 1.5 s after every graph change.  Skipped during initial hydration.
 * Auto-save does NOT recompile — the running execution is NOT updated.
 */
export default function FuseStudioPage() {
  const { id } = useParams();

  // -- Store reads ----------------------------------------------------------
  const workflowName  = useFuseStudioStore((s) => s.workflowName);
  const loading       = useFuseStudioStore((s) => s.loading);
  const savingName        = useFuseStudioStore((s) => s.savingName);
  const storeWorkflow = useFuseStudioStore((s) => s.workflow);
  const nodes         = useFuseStudioStore((s) => s.nodes);
  const edges         = useFuseStudioStore((s) => s.edges);
  const compilationErrors = useFuseStudioStore((s) => s.compilationErrors);
  const activating    = useFuseStudioStore((s) => s.activating);
  const deactivating  = useFuseStudioStore((s) => s.deactivating);

  // For mobile bottom-sheet: track selected node and adding-node mode
  const selectedNode  = useFuseStudioStore((s) => s.selectedNode);
  const addingNode    = useFuseStudioStore((s) => s.addingNode);

  // Mobile panel open/close state
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  // Derived: any async activation/deactivation call is in-flight
  const inFlight = activating || deactivating;

  // Enable header buttons only once a starter (trigger) node is on the canvas
  const hasStarterNode = nodes.some((n) => n.data?.isStarter === true);

  // Derive the workflow active status and webhook URL from store state
  const isActive = storeWorkflow?.status === "active";

  // Auto-open the panel when a node is selected or the add-node picker opens
  useEffect(() => {
    if (selectedNode || addingNode) setMobilePanelOpen(true);
  }, [selectedNode, addingNode]);

  // Auto-open on mobile when loading is done and no starter node exists yet
  // so the StarterPanel (trigger picker) is immediately visible
  useEffect(() => {
    if (!loading && !hasStarterNode) setMobilePanelOpen(true);
  }, [loading, hasStarterNode]);

  // -- Store actions --------------------------------------------------------
  const setWorkflow           = useFuseStudioStore((s) => s.setWorkflow);
  const setWorkflowName       = useFuseStudioStore((s) => s.setWorkflowName);
  const setLoading            = useFuseStudioStore((s) => s.setLoading);
  const setSavingName             = useFuseStudioStore((s) => s.setSavingName);
  const setSaving                 = useFuseStudioStore((s) => s.setSaving);
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

  // -- Load workflow + node definitions -------------------------------------
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

        // -- Load graph ------------------------------------------------------
        // wf.nodes  = workflow logic nodes
        // wf.blocks = purely-visual block overlays (rendered first so they sit behind)
        setNodes([...(wf.blocks ?? []), ...(wf.nodes ?? [])]);
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

  // -- Auto-save graph (debounced 1.5 s) -----------------------------------
  // Splits the ReactFlow nodes array into workflow nodes (fuse_node) and
  // visual block overlays (fuse_block) before calling the API so the two
  // concerns are always stored under separate keys and never mixed.
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (loading || !storeWorkflow) return;
    setSaving(true);
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const workflowNodes = nodes.filter((n) => n.type !== "fuse_block");
      const blocks        = nodes.filter((n) => n.type === "fuse_block");
      updateWorkflowGraphAPI(id, workflowNodes, edges, blocks)
        .catch(() => {})
        .finally(() => setSaving(false));
    }, 1500);
    return () => {
      clearTimeout(saveTimerRef.current)
      setSaving(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  // -- Name autosave on blur ------------------------------------------------
  const handleNameBlur = async () => {
    const trimmed = workflowName.trim() || "Untitled Workflow";
    if (!workflowName.trim()) setWorkflowName("Untitled Workflow");
    if (trimmed === committedNameRef.current) return;

    setSavingName(true);
    try {
      await updateWorkflowNameAPI(id, trimmed);
      committedNameRef.current = trimmed;
      if (storeWorkflow) setWorkflow({ ...storeWorkflow, name: trimmed });
    } catch {
      setWorkflowName(committedNameRef.current);
    } finally {
      setSavingName(false);
    }
  };

  // -- Activate (Turn On / Recompile) --------------------------------------
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

  // -- Deactivate (Turn Off) -----------------------------------------------
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
    <main className="h-screen flex flex-col overflow-hidden bg-white dark:bg-void-875 bg-aurora-glow dark:bg-aurora-glow-dark">
      <FuseStudioHeader
        name={loading ? "" : workflowName}
        workflowId={id}
        onNameChange={setWorkflowName}
        onNameBlur={handleNameBlur}
        savingName={savingName}
        isLoading={loading}
      />

      <div className="flex-1 flex overflow-hidden">
        <FuseStudioSidebar creating={creating} onCreate={handleCreate} hideMobileNav />
        <div
          className="relative flex-1 flex flex-col md:flex-row gap-0 md:gap-2.5
            p-0 md:p-4
            mb-16 md:mb-3 mr-0 md:mr-3
            md:rounded-xl
            md:border md:border-ink-150 md:dark:border-void-825
            bg-ink-25 dark:bg-void-850
            md:shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] md:dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]"
        >
          {/* Canvas */}
          <div className="relative flex-1 min-w-0 min-h-0">
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

          {/* NodeConfigPanel — side panel on desktop, bottom-sheet with handle on mobile */}
          <div
            className={`
              flex flex-col
              absolute inset-x-0 bottom-0 z-30 h-[64vh]
              md:relative md:flex-1 md:max-w-[550px] md:h-auto md:translate-y-0
              transition-transform duration-300 ease-in-out
              ${mobilePanelOpen ? "translate-y-0" : "translate-y-[calc(100%+4rem)]"}
            `}
          >
            {/* Handle bar — mobile only */}
            <div
              className="flex md:hidden items-center justify-between px-4 py-2.5 flex-shrink-0
                bg-white dark:bg-void-875 rounded-t-2xl
                border-t border-x border-ink-150 dark:border-void-800
                shadow-[0_-6px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-6px_24px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-center gap-2">
                <TbSettings2 className="w-4 h-4 text-ink-500 dark:text-ink-600" />
                <span className="text-[12px] font-semibold text-ink-700 dark:text-ink-350">
                  Configure
                </span>
              </div>
              <button
                onClick={() => setMobilePanelOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg
                  text-ink-500 dark:text-ink-600
                  hover:text-ink-750 dark:hover:text-white
                  hover:bg-ink-75 dark:hover:bg-void-800
                  transition-colors"
                aria-label="Close panel"
              >
                <TbChevronDown className="w-4 h-4" />
              </button>
            </div>

            <NodeConfigPanel
              className="flex-1 min-h-0 md:rounded-xl rounded-none
                border-t-0 md:border-t
                bg-white dark:bg-void-875
                border border-ink-150 dark:border-void-800
                shadow-sm overflow-hidden"
            />
          </div>

          {/* Mobile backdrop */}
          {mobilePanelOpen && (
            <div
              className="absolute inset-0 z-20 bg-black/20 dark:bg-black/40 md:hidden"
              onClick={() => setMobilePanelOpen(false)}
            />
          )}
        </div>
      </div>

      {/* -- Mobile studio action bar -------------------------------------- */}
      <MobileActionBar
        mobilePanelOpen={mobilePanelOpen}
        setMobilePanelOpen={setMobilePanelOpen}
        hasStarterNode={hasStarterNode}
        inFlight={inFlight}
        deactivating={deactivating}
        isActive={isActive}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
      />
    </main>
  );
}
