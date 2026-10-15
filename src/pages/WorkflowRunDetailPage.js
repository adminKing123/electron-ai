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
} from "react-icons/tb";
import { iconBtnCls } from "../components/Fuse/FuseStudioHeader";
import { WorkflowCanvas } from "../components/Fuse";
import FuseRunNodePanel from "../components/Fuse/FuseRunNodePanel";
import { RunStatusBadge } from "../components/Fuse/fuseRunFormatters";
import { getWorkflowByIdAPI } from "../apis/fuse/queryFunctions";
import useFuseRunLive from "../hooks/useFuseRunLive";
import useFuseStudioStore from "../store/useFuseStudioStore";
import HeaderUserProfile from "../components/HeaderUserProfile";
import ROUTES from "../router/routes";

const TriggerIcon = ({ type }) => {
  const icons = { webhook: TbWebhook, schedule: TbCalendarTime, manual: TbBolt };
  const Icon = icons[type] ?? TbBolt;
  return <Icon className="w-4 h-4 text-[#888] dark:text-[#555]" />;
};

const ConnectionPill = ({ status }) => {
  const live = status === "connected";
  const pending = status === "connecting" || status === "idle";
  const Icon = live ? TbWifi : TbWifiOff;
  const label = live ? "Live" : pending ? "Connecting…" : "Offline";
  const cls = live
    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    : pending
      ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      : "text-[#888] dark:text-[#555] bg-[#f5f5f5] dark:bg-[#1a1a1a] border-[#e8e8e8] dark:border-[#2a2a2a]";

  return (
    <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cls}`}>
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

  useEffect(() => {
    resetStudio();
    setLoading(true);
    return () => resetStudio();
  }, [resetStudio, setLoading]);

  useEffect(() => {
    const workflowId = run?.workflow_id;

    if (!workflowId) {
      if (liveError || connectionStatus === "error") {
        setLoading(false);
      }
      return;
    }

    let cancelled = false;
    setLoading(true);
    getWorkflowByIdAPI(workflowId)
      .then((wf) => {
        if (cancelled) return;
        setNodes([...(wf.blocks ?? []), ...(wf.nodes ?? [])]);
        setEdges(wf.edges ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [run?.workflow_id, liveError, connectionStatus, setLoading, setNodes, setEdges]);

  const handleRunNodeSelect = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const selectedNodeState = useMemo(() => {
    if (!selectedNode) return null;
    return nodeStates[selectedNode.id] ?? null;
  }, [selectedNode, nodeStates]);

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      await reconnect();
    } finally {
      setReconnecting(false);
    }
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121] text-black dark:text-white">
      <header className="w-full flex-shrink-0 bg-[#ffffff] dark:bg-[#212121]">
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
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb] dark:text-[#555] leading-none mb-0.5">
                  Run Detail
                </p>
                <p className="text-[13px] font-mono font-semibold text-[#111] dark:text-white truncate leading-tight">
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

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div
            className="relative flex-1 flex flex-col md:flex-row gap-0 md:gap-2.5 min-h-0 overflow-hidden
              p-0 md:p-4
              mb-0 md:mb-3 ml-0 md:ml-3 mr-0 md:mr-3
              md:rounded-xl
              md:border md:border-[#e5e5e5] md:dark:border-[#252525]
              bg-[#f7f7f7] dark:bg-[#1a1a1a]
              md:shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] md:dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]"
          >
            <div className="relative flex-1 min-w-0 min-h-0">
              <WorkflowCanvas
                className="h-full"
                readOnly
                runNodeStates={nodeStates}
                activeNodeId={activeNodeId}
                selectedNodeId={selectedNode?.id ?? null}
                onRunNodeSelect={handleRunNodeSelect}
              />
            </div>

            <div
              className="hidden md:flex flex-col flex-1 md:max-w-[420px] min-h-0 overflow-hidden
                md:rounded-xl
                bg-white dark:bg-[#212121]
                border border-[#e5e5e5] dark:border-[#2a2a2a]
                shadow-sm"
            >
              <FuseRunNodePanel
                selectedNode={selectedNode}
                nodeState={selectedNodeState}
                nodeStates={nodeStates}
                isActiveNode={selectedNode?.id === activeNodeId}
                run={run}
              />
            </div>
          </div>
        </div>

        <div className="md:hidden flex-shrink-0 h-[42vh] min-h-[200px] border-t border-[#e5e5e5] dark:border-[#1e1e1e] bg-white dark:bg-[#212121] overflow-hidden">
          <FuseRunNodePanel
            selectedNode={selectedNode}
            nodeState={selectedNodeState}
            nodeStates={nodeStates}
            isActiveNode={selectedNode?.id === activeNodeId}
            run={run}
          />
        </div>
      </div>
    </main>
  );
};

export default WorkflowRunDetailPage;
