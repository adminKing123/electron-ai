import { create } from "zustand";

/**
 * Zustand store for the Fuse Studio (workflow builder) page.
 *
 * All page-level state lives here so FuseStudioPage has zero useState calls.
 *
 * State shape:
 *   workflow       — full workflow object from API ({ id, name, status, steps[], … })
 *   workflowName   — controlled input value; may temporarily differ from workflow.name while editing
 *   loading        — true while the workflow is being fetched
 *   saving         — true while a name change is being persisted
 *   starterNodes   — node definitions fetched from the backend (cached across workflows)
 *   loadingNodes   — true while starterNodes are being fetched
 *   selectedNode   — currently selected step/node object in the canvas (null if none)
 */
const useFuseStudioStore = create((set) => ({
  // ─── Workflow ──────────────────────────────────────────────────────────────
  workflow: null,
  workflowName: "",
  loading: false,
  saving: false,

  // ─── Node definitions (from API) ──────────────────────────────────────────
  /** Starter node definitions — cached; not cleared on resetStudio. */
  starterNodes: [],
  loadingNodes: false,

  // ─── Canvas ───────────────────────────────────────────────────────────────
  selectedNode: null,

  // ─── Actions ──────────────────────────────────────────────────────────────

  /** Replace the entire workflow object (on load or after a name save). */
  setWorkflow: (workflow) => set({ workflow }),

  /** Update the controlled name input value. */
  setWorkflowName: (name) => set({ workflowName: name }),

  setLoading: (v) => set({ loading: v }),
  setSaving: (v) => set({ saving: v }),

  /** Cache the starter node definitions returned by the API. */
  setStarterNodes: (nodes) => set({ starterNodes: nodes }),
  setLoadingNodes: (v) => set({ loadingNodes: v }),

  /** Replace the steps array on the loaded workflow. */
  setSteps: (steps) =>
    set((state) => ({
      workflow: state.workflow ? { ...state.workflow, steps } : state.workflow,
    })),

  /**
   * Append a new step to workflow.steps.
   * @param {{ id: string, type: string, label: string, config: object }} step
   */
  addStep: (step) =>
    set((state) => {
      if (!state.workflow) return {};
      return {
        workflow: {
          ...state.workflow,
          steps: [...(state.workflow.steps ?? []), step],
        },
      };
    }),

  /**
   * Persist updated config values for a specific step.
   * Also syncs selectedNode if it is the step being updated.
   * @param {string} stepId
   * @param {object} config - complete new config object for that step
   */
  updateStepConfig: (stepId, config) =>
    set((state) => {
      if (!state.workflow) return {};
      const steps = state.workflow.steps.map((s) =>
        s.id === stepId ? { ...s, config } : s
      );
      const selectedNode =
        state.selectedNode?.id === stepId
          ? { ...state.selectedNode, config }
          : state.selectedNode;
      return { workflow: { ...state.workflow, steps }, selectedNode };
    }),

  selectNode: (node) => set({ selectedNode: node }),
  clearSelectedNode: () => set({ selectedNode: null }),

  /**
   * Clear workflow and canvas state on page unmount.
   * Intentionally preserves starterNodes — they are reusable across workflows.
   */
  resetStudio: () =>
    set({
      workflow: null,
      workflowName: "",
      loading: false,
      saving: false,
      selectedNode: null,
    }),
}));

export default useFuseStudioStore;
