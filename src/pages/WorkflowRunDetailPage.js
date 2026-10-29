/**
 * WorkflowRunDetailPage.js
 * Live run view: read-only studio canvas + node detail panel (WebSocket).
 *
 * Route: /fuse/runs/:runId
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  TbRefresh,
  TbBolt,
  TbCalendarTime,
  TbWebhook,
  TbWifi,
  TbWifiOff,
  TbChevronDown,
  TbListDetails,
} from "react-icons/tb";
import { iconBtnCls } from "../components/Fuse/FuseStudioHeader";
import { WorkflowCanvas } from "../components/Fuse";
import FuseRunNodePanel from "../components/Fuse/FuseRunNodePanel";
import { RunStatusBadge } from "../components/Fuse/fuseRunFormatters";
import { getWorkflowByIdAPI, getVersionAPI } from "../apis/fuse/queryFunctions";
import { loadRunDetailCanvas } from "../utils/fuseVersionStudio";
import useFuseRunLive from "../hooks/useFuseRunLive";
import useFuseStudioStore from "../store/useFuseStudioStore";
import HeaderUserProfile from "../components/HeaderUserProfile";
import ROUTES from "../router/routes";

const TriggerIcon = ({ type }) => {
  const icons = { webhook: TbWebhook, schedule: TbCalendarTime, manual: TbBolt };
  const Icon = icons[type] ?? TbBolt;
  return <Icon className="w-4 h-4 text-ink-500 dark:text-ink-550" />;
};

const ConnectionPill = ({ status }) => {
  const live = status === "connected";
  const pending = status === "connecting" || status === "idle";
  const Icon = live ? TbWifi : TbWifiOff;
  const label = live ? "Live" : pending ? "Connecting..." : "Offline";
  const cls = live
    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    : pending
      ? "text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800"
      : "text-ink-500 dark:text-ink-550 bg-ink-50 dark:bg-void-850 border-ink-100 dark:border-void-800";

  return (
    <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>
      <Icon className={`w-3 h-3 ${pending ? "animate-pulse" : ""}`} />
      {label}
    </span>
  );
};

const WorkflowRunDetailPage = () => {
  const { runId } = useParams();
  const navigate = useNavigate();

  const {
    run,
    nodeStates,
    activeNodeId,
    activeNodeIds,
    connectionStatus,
    error: liveError,
    reconnect,
  } = useFuseRunLive(runId);

  const setLoading = useFuseStudioStore((s) => s.setLoading);
  const setNodes = useFuseStudioStore((s) => s.setNodes);
  const setEdges = useFuseStudioStore((s) => s.setEdges);
  const resetStudio = useFuseStudioStore((s) => s.resetStudio);

  const [selectedNode, setSelectedNode] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState(null);

  useEffect(() => {
    resetStudio();
    setLoading(true);
    return () => resetStudio();
  }, [resetStudio, setLoading]);

  useEffect(() => {
    if (!run?.workflow_id && (liveError || connectionStatus === "error")) {
      setLoading(false);
    }
  }, [run?.workflow_id, liveError, connectionStatus, setLoading]);

  useEffect(() => {
    const workflowId = run?.workflow_id;
    const versionId = run?.version_id;
    if (!workflowId) return;

    let cancelled = false;
    setLoading(true);

    loadRunDetailCanvas(
      { versionId, workflowId },
      { getVersionAPI, getWorkflowByIdAPI },
    )
      .then((result) => {
        if (cancelled) return;
        setWorkflowName(result.workflowName);
        setNodes(result.nodes);
        setEdges(result.edges);
      })
      .catch(() => {
        /* canvas stays empty */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [run?.workflow_id, run?.version_id, setLoading, setNodes, setEdges]);

  const handleRunNodeSelect = useCallback((node) => {
    setSelectedNode(node);
    setMobilePanelOpen(true);
  }, []);

  useEffect(() => {
    if (run?.run_id) setMobilePanelOpen(true);
  }, [run?.run_id]);

  const selectedNodeState = useMemo(() => {
    if (!selectedNode) return null;
    return nodeStates[selectedNode.id] ?? null;
  }, [selectedNode, nodeStates]);

  const mobilePanelTitle = selectedNode
    ? selectedNode.data?.label ?? selectedNodeState?.node_label ?? "Node"
    : "Workflow run";

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      await reconnect();
    } finally {
      setReconnecting(false);
    }
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-white dark:bg-void-875 bg-aurora-glow dark:bg-aurora-glow-dark text-ink-950 dark:text-white">
      <header className="w-full flex-shrink-0 bg-transparent">
        <div className="h-[56px] w-full flex items-center justify-between gap-2 px-3">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <button
              onClick={() => {
                if (run?.workflow_id) navigate(ROUTES.GET_FUSE_RUNS_URL(run.workflow_id));
                else navigate(-1);
              }}
              className={`${iconBtnCls} flex-shrink-0`}
              title="Back to run history"
            >
              <IoChevronBackOutline className="w-[18px] h-[18px]" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              {run && <TriggerIcon type={run.trigger_type} />}
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-450 dark:text-ink-550 leading-none mb-0.5">
                  Run Detail
                </p>
                <p className="text-[13px] font-mono font-semibold text-ink-975 dark:text-white truncate leading-tight">
                  {runId}
                </p>
              </div>
              {run && (
                <span className="hidden sm:inline-flex gap-2 items-center">
                  <RunStatusBadge status={run.status} large />
                  <ConnectionPill status={connectionStatus} />
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleReconnect}
              disabled={reconnecting}
              title="Reconnect live stream"
              className={`${iconBtnCls} disabled:opacity-40`}
            >
              <TbRefresh className={`w-[16px] h-[16px] ${reconnecting ? "animate-spin" : ""}`} />
            </button>
            <HeaderUserProfile />
          </div>
        </div>
      </header>

      {(liveError || connectionStatus === "error") && (
        <div className="flex-shrink-0 px-3 py-2 bg-amber-50 dark:bg-amber-900/15 border-b border-amber-200 dark:border-amber-800 text-[12px] text-amber-800 dark:text-amber-200">
          {liveError || "Live connection lost. Use refresh to reconnect."}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div
          className="relative flex-1 flex flex-col md:flex-row gap-0 md:gap-2.5 min-h-0 overflow-hidden
            p-0 md:p-4
            mb-16 md:mb-3 ml-0 md:ml-3 mr-0 md:mr-3
            md:rounded-xl
            md:border md:border-ink-150 md:dark:border-void-825
            bg-ink-25 dark:bg-void-850
            md:shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] md:dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]"
        >
          <div className="relative flex-1 min-w-0 min-h-0">
            <WorkflowCanvas
              className="h-full"
              readOnly
              runNodeStates={nodeStates}
              activeNodeId={activeNodeId}
              activeNodeIds={activeNodeIds}
              selectedNodeId={selectedNode?.id ?? null}
              onRunNodeSelect={handleRunNodeSelect}
            />
          </div>

          {/* Run panel — side on desktop, bottom sheet on mobile (matches Fuse Studio) */}
          <div
            className={`
              flex flex-col
              absolute inset-x-0 bottom-0 z-30 h-[64vh]
              md:relative md:flex-1 md:max-w-[420px] md:h-auto md:min-h-0 md:translate-y-0
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
              <div className="flex items-center gap-2 min-w-0">
                <TbListDetails className="w-4 h-4 flex-shrink-0 text-ink-500 dark:text-ink-600" />
                <span className="text-[12px] font-semibold text-ink-700 dark:text-ink-350 truncate">
                  {mobilePanelTitle}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobilePanelOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0
                  text-ink-500 dark:text-ink-600
                  hover:text-ink-750 dark:hover:text-white
                  hover:bg-ink-75 dark:hover:bg-void-800
                  transition-colors"
                aria-label="Close panel"
              >
                <TbChevronDown className="w-4 h-4" />
              </button>
            </div>

            <FuseRunNodePanel
              className="flex-1 min-h-0 md:rounded-xl rounded-none
                border-t-0 md:border-t
                bg-white dark:bg-void-875
                border border-ink-150 dark:border-void-800
                shadow-sm overflow-hidden"
              selectedNode={selectedNode}
              nodeState={selectedNodeState}
              nodeStates={nodeStates}
              isActiveNode={
                selectedNode?.id === activeNodeId ||
                selectedNodeState?.status === "running"
              }
              run={run}
              workflowName={workflowName}
            />
          </div>

          {mobilePanelOpen && (
            <div
              className="absolute inset-0 z-20 bg-black/20 dark:bg-black/40 md:hidden"
              onClick={() => setMobilePanelOpen(false)}
              aria-hidden
            />
          )}
        </div>
      </div>

      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-50
          bg-white dark:bg-void-850
          border-t border-ink-150 dark:border-void-825
          px-2 py-1 justify-center items-center"
      >
        <button
          type="button"
          onClick={() => setMobilePanelOpen((v) => !v)}
          className={`flex flex-col items-center justify-center gap-0.5 w-20 py-2 rounded-xl
            text-[11px] font-semibold select-none transition-colors
            ${
              mobilePanelOpen
                ? "text-ink-975 dark:text-white"
                : "text-ink-600 dark:text-ink-450 hover:text-ink-875 dark:hover:text-ink-200"
            }`}
        >
          <TbListDetails className="w-[20px] h-[20px]" />
          <span>Details</span>
        </button>
      </nav>
    </main>
  );
};

export default WorkflowRunDetailPage;
