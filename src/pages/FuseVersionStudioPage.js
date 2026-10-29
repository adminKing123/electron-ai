import React, { useEffect, useState } from "react";
import { TbSettings2, TbChevronDown } from "react-icons/tb";
import { useNavigate, useParams } from "react-router-dom";
import {
  FuseStudioHeader,
  FuseStudioSidebar,
  WorkflowCanvas,
  NodeConfigPanel,
} from "../components/Fuse";
import {
  getWorkflowByIdAPI,
  getVersionAPI,
} from "../apis/fuse/queryFunctions";
import { loadVersionStudioById } from "../utils/fuseVersionStudio";
import { fmtVersionIdLink } from "../components/Fuse/fuseListingTable";
import useFuseNodeCatalog from "../hooks/useFuseNodeCatalog";
import useFuseStudioStore from "../store/useFuseStudioStore";
import ROUTES from "../router/routes";

/**
 * Read-only Fuse Studio view for a compiled graph version (fuse_versions).
 * Route: /fuse/studio/version/:versionId
 */
export default function FuseVersionStudioPage() {
  const { versionId } = useParams();
  const navigate = useNavigate();

  const workflowName = useFuseStudioStore((s) => s.workflowName);
  const loading = useFuseStudioStore((s) => s.loading);
  const selectedNode = useFuseStudioStore((s) => s.selectedNode);

  const setWorkflowName = useFuseStudioStore((s) => s.setWorkflowName);
  const setLoading = useFuseStudioStore((s) => s.setLoading);
  const setNodes = useFuseStudioStore((s) => s.setNodes);
  const setEdges = useFuseStudioStore((s) => s.setEdges);
  const resetCanvas = useFuseStudioStore((s) => s.resetCanvas);
  const resetStudio = useFuseStudioStore((s) => s.resetStudio);

  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [viewMeta, setViewMeta] = useState(null);

  useFuseNodeCatalog();

  useEffect(() => {
    if (selectedNode) setMobilePanelOpen(true);
  }, [selectedNode]);

  useEffect(() => () => resetStudio(), [resetStudio]);

  useEffect(() => {
    let cancelled = false;

    resetCanvas();
    setLoadError(null);
    setViewMeta(null);
    setLoading(true);

    loadVersionStudioById(versionId, { getVersionAPI, getWorkflowByIdAPI })
      .then((result) => {
        if (cancelled) return;
        setWorkflowName(result.workflowName);
        setNodes(result.nodes);
        setEdges(result.edges);
        setViewMeta({
          workflowId: result.workflowId,
          versionCreatedAt: result.versionCreatedAt,
          usedDraftFallback: result.usedDraftFallback,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err?.code === "missing_workflow"
            ? err.message
            : "Failed to load this version.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [versionId, resetCanvas, setLoading, setWorkflowName, setNodes, setEdges]);

  const workflowId = viewMeta?.workflowId ?? null;

  const handleBack = () => {
    if (workflowId) navigate(ROUTES.GET_FUSE_RUNS_URL(workflowId));
    else navigate(ROUTES.FUSES_LISTING);
  };

  const versionLabel = fmtVersionIdLink(versionId);
  const versionCreatedAt = viewMeta?.versionCreatedAt;

  const headerTitle = loading ? "" : `Version ${versionLabel}`;
  const headerSubtitle = loading ? "..." : (workflowName || "Untitled Workflow");

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-white dark:bg-void-875 bg-aurora-glow dark:bg-aurora-glow-dark">
      <FuseStudioHeader
        name={headerTitle}
        isLoading={loading}
        readOnly
        onBack={handleBack}
        backTitle="Back to run history"
        subtitle={headerSubtitle}
        nameTitle={
          versionCreatedAt
            ? `${headerTitle} · ${new Date(versionCreatedAt).toLocaleString()}`
            : undefined
        }
      />

      {loadError && (
        <div className="flex-shrink-0 px-4 py-2.5 text-[13px] border-b border-red-200 dark:border-red-900/50
          bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
          {loadError}
        </div>
      )}

      {!loading && viewMeta?.usedDraftFallback && !loadError && (
        <div className="flex-shrink-0 px-4 py-2.5 text-[12px] border-b border-amber-200 dark:border-amber-800/50
          bg-amber-50 dark:bg-amber-950/25 text-amber-800 dark:text-amber-200">
          This version has no saved canvas snapshot. Showing the workflow draft instead.
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <FuseStudioSidebar hideMobileNav showCreate={false} />
        <div
          className="relative flex-1 flex flex-col md:flex-row gap-0 md:gap-2.5
            p-0 md:p-4
            mb-3 mr-0 md:mr-3
            md:rounded-xl
            md:border md:border-ink-150 md:dark:border-void-825
            bg-ink-25 dark:bg-void-850
            md:shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] md:dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]"
        >
          <div className="relative flex-1 min-w-0 min-h-0">
            <WorkflowCanvas className="h-full" readOnly />
          </div>

          <div
            className={`
              flex flex-col
              absolute inset-x-0 bottom-0 z-30 h-[64vh]
              md:relative md:flex-1 md:max-w-[550px] md:h-auto md:translate-y-0
              transition-transform duration-300 ease-in-out
              ${mobilePanelOpen ? "translate-y-0" : "translate-y-[calc(100%+4rem)]"}
            `}
          >
            <div
              className="flex md:hidden items-center justify-between px-4 py-2.5 flex-shrink-0
                bg-white dark:bg-void-875 rounded-t-2xl
                border-t border-x border-ink-150 dark:border-void-800
                shadow-[0_-6px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-6px_24px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-center gap-2">
                <TbSettings2 className="w-4 h-4 text-ink-500 dark:text-ink-600" />
                <span className="text-[12px] font-semibold text-ink-700 dark:text-ink-350">
                  View configuration
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
              readOnly
              workflowId={workflowId}
              className="flex-1 min-h-0 md:rounded-xl rounded-none
                border-t-0 md:border-t
                bg-white dark:bg-void-875
                border border-ink-150 dark:border-void-800
                shadow-sm overflow-hidden"
            />
          </div>

          {mobilePanelOpen && (
            <div
              className="absolute inset-0 z-20 bg-black/20 dark:bg-black/40 md:hidden"
              onClick={() => setMobilePanelOpen(false)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
