/**
 * WorkflowRunDetailPage.js
 * ─────────────────────────
 * Shows the per-node execution logs and any errors for a single workflow run.
 *
 * Route: /fuse/runs/:runId
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  TbRefresh,
  TbCircleCheck,
  TbCircleX,
  TbMinus,
  TbLoader2,
  TbBolt,
  TbCalendarTime,
  TbWebhook,
  TbChevronDown,
  TbChevronRight,
  TbChevronLeft,
  TbAlertCircle,
} from "react-icons/tb";
import { iconBtnCls } from "../components/Fuse/FuseStudioHeader";
import { getRunAPI, getRunLogsAPI } from "../apis/fuse/queryFunctions";
import HeaderUserProfile from "../components/HeaderUserProfile";
import ROUTES from "../router/routes";

const PAGE_SIZE = 25;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month:  "short",
      day:    "numeric",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fmtDuration(ms) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function prettyJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const RunStatusBadge = ({ status, large = false }) => {
  const map = {
    success: {
      icon: TbCircleCheck,
      cls:  "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    },
    failed: {
      icon: TbCircleX,
      cls:  "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    },
    running: {
      icon: TbLoader2,
      cls:  "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      spin: true,
    },
  };
  const { icon: Icon, cls, spin } = map[status] ?? map.failed;
  const sizeIcon = large ? "w-4 h-4" : "w-3 h-3";
  const textSize = large ? "text-[13px]" : "text-[11px]";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border ${textSize} ${cls}`}>
      <Icon className={`${sizeIcon} ${spin ? "animate-spin" : ""}`} />
      {status}
    </span>
  );
};

const NodeStatusIcon = ({ status }) => {
  if (status === "success")
    return <TbCircleCheck className="w-[15px] h-[15px] text-green-500 dark:text-green-400 flex-shrink-0" />;
  if (status === "error")
    return <TbCircleX className="w-[15px] h-[15px] text-red-500 dark:text-red-400 flex-shrink-0" />;
  return <TbMinus className="w-[15px] h-[15px] text-[#bbb] dark:text-[#555] flex-shrink-0" />;
};

const TriggerIcon = ({ type }) => {
  const icons = { webhook: TbWebhook, schedule: TbCalendarTime, manual: TbBolt };
  const Icon = icons[type] ?? TbBolt;
  return <Icon className="w-4 h-4 text-[#888] dark:text-[#555]" />;
};

/** Expandable JSON block */
const JsonBlock = ({ label, value }) => {
  const [open, setOpen] = useState(false);
  if (!value || (typeof value === "object" && Object.keys(value).length === 0)) return null;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[11.5px] font-medium text-[#888] dark:text-[#555]
          hover:text-[#555] dark:hover:text-[#888] transition-colors"
      >
        {open
          ? <TbChevronDown className="w-3.5 h-3.5" />
          : <TbChevronRight className="w-3.5 h-3.5" />
        }
        {label}
      </button>
      {open && (
        <pre className="mt-2 p-3 rounded-lg text-[11.5px] font-mono leading-relaxed
          bg-[#f7f7f7] dark:bg-[#1a1a1a]
          border border-[#e8e8e8] dark:border-[#2a2a2a]
          text-[#333] dark:text-[#ccc]
          overflow-x-auto whitespace-pre-wrap break-words">
          {prettyJson(value)}
        </pre>
      )}
    </div>
  );
};

/** Single node log row */
const LogRow = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = log.output || log.error;

  return (
    <div className="border-b border-[#f0f0f0] dark:border-[#1d1d1d] last:border-b-0">
      <button
        type="button"
        onClick={() => hasDetails && setExpanded((v) => !v)}
        className={`w-full flex items-center gap-2 sm:gap-3 px-3 py-3 sm:px-5 sm:py-3.5 text-left
          ${hasDetails ? "hover:bg-[#fafafa] dark:hover:bg-[#1e1e1e] cursor-pointer" : "cursor-default"}
          transition-colors`}
      >
        <NodeStatusIcon status={log.status} />

        {/* Node label + type */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#222] dark:text-[#ddd] truncate">
            {log.node_label}
          </p>
          <p className="text-[11px] text-[#bbb] dark:text-[#555] font-mono">
            {log.node_type}
          </p>
        </div>

        {/* Error summary — hidden on mobile to save space */}
        {log.status === "error" && log.error && (
          <p className="hidden sm:block text-[11.5px] text-red-500 dark:text-red-400 max-w-[200px] truncate text-right flex-shrink-0">
            {log.error_type ? `${log.error_type}: ` : ""}{log.error}
          </p>
        )}

        {/* Duration */}
        <span className="text-[12px] text-[#aaa] dark:text-[#555] font-mono text-right flex-shrink-0 w-14 sm:w-16">
          {fmtDuration(log.duration_ms)}
        </span>

        {/* Expand chevron */}
        {hasDetails && (
          expanded
            ? <TbChevronDown className="w-4 h-4 text-[#ccc] dark:text-[#444] flex-shrink-0" />
            : <TbChevronRight className="w-4 h-4 text-[#ccc] dark:text-[#444] flex-shrink-0" />
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-3 pb-3 ml-5 sm:px-5 sm:pb-4 sm:ml-6">
          {log.status === "error" && log.error && (
            <div className="flex items-start gap-2 p-3 rounded-lg mt-1
              bg-red-50 dark:bg-red-900/15
              border border-red-200 dark:border-red-800">
              <TbAlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                {log.error_type && (
                  <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 mb-0.5">
                    {log.error_type}
                  </p>
                )}
                <p className="text-[12px] text-red-600 dark:text-red-400 font-mono break-words">
                  {log.error}
                </p>
              </div>
            </div>
          )}
          <JsonBlock label="Output" value={log.output} />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="flex flex-col gap-1 px-3 py-3 sm:px-5 sm:py-4 bg-white dark:bg-[#171717]
    border border-[#ebebeb] dark:border-[#232323] rounded-xl">
    <p className="text-[11px] font-medium text-[#aaa] dark:text-[#555] uppercase tracking-wider">
      {label}
    </p>
    <p className="text-[17px] sm:text-[20px] font-semibold text-[#111] dark:text-[#e0e0e0]">
      {value}
    </p>
  </div>
);

// ─── Main page ─────────────────────────────────────────────────────────────────

const WorkflowRunDetailPage = () => {
  const { runId }  = useParams();
  const navigate   = useNavigate();

  const [run,         setRun]         = useState(null);
  const [logs,        setLogs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState(null);

  // Cursor-based log pagination — ref so fetchLogs always reads the latest cursor
  const [logPage,        setLogPage]        = useState(0);
  const [hasNextLogPage, setHasNextLogPage] = useState(false);
  const logCursorsRef = useRef([null]); // logCursorsRef.current[i] = next_cursor for page i

  const fetchRun = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const runData = await getRunAPI(runId);
      setRun(runData);
    } catch {
      setError("Failed to load run details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [runId]);

  const fetchLogs = useCallback(async (pageIndex) => {
    setLogsLoading(true);
    const cursor = logCursorsRef.current[pageIndex];
    const params = { limit: PAGE_SIZE };
    if (cursor) {
      params.after_started_at = cursor.after_started_at;
      params.after_log_id     = cursor.after_log_id;
    }
    try {
      const result = await getRunLogsAPI(runId, params);
      setLogs(result.items ?? []);
      setHasNextLogPage(!!result.next_cursor);
      if (result.next_cursor) {
        logCursorsRef.current[pageIndex + 1] = result.next_cursor;
      }
    } catch {
      // Silently fail for log page changes; run details already shown
    } finally {
      setLogsLoading(false);
    }
  }, [runId]);

  // Initial load
  useEffect(() => {
    fetchRun();
    fetchLogs(0);
  }, [fetchRun, fetchLogs]);

  // Auto-refresh while run is still running
  useEffect(() => {
    if (!run || run.status !== "running") return;
    const t = setTimeout(() => {
      fetchRun(true);
      fetchLogs(logPage);
    }, 3000);
    return () => clearTimeout(t);
  }, [run, logPage, fetchRun, fetchLogs]);

  const handleRefresh = () => {
    logCursorsRef.current = [null];
    setLogPage(0);
    fetchRun(true);
    fetchLogs(0);
  };

  const handleLogPageChange = (newPage) => {
    setLogPage(newPage);
    fetchLogs(newPage);
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121] text-black dark:text-white">
      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-[#ffffff] dark:bg-[#212121]
        border-b border-[#e5e5e5] dark:border-[#1e1e1e]">
        <div className="h-[56px] w-full flex items-center justify-between gap-2 px-3">
          {/* Left: back + title */}
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
                  {loading ? "…" : runId}
                </p>
              </div>
              {run && (
                <span className="hidden sm:inline-flex">
                  <RunStatusBadge status={run.status} large />
                </span>
              )}
            </div>
          </div>

          {/* Right: refresh + profile */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              title="Refresh"
              className={`${iconBtnCls} disabled:opacity-40`}
            >
              <TbRefresh className={`w-[16px] h-[16px] ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <HeaderUserProfile />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-4 sm:px-6 sm:py-6 max-w-4xl mx-auto flex flex-col gap-5">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20
            border border-red-200 dark:border-red-800
            text-[13px] text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ── Stats ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-[#ebebeb] dark:bg-[#1e1e1e]" />
            ))}
          </div>
        ) : run && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Nodes Ran"       value={run.node_count      ?? 0} />
            <StatCard label="Succeeded"       value={run.nodes_succeeded ?? 0} />
            <StatCard label="Failed"          value={run.nodes_failed    ?? 0} />
            <StatCard label="Duration"        value={fmtDuration(run.duration_ms)} />
          </div>
        )}

        {/* ── Run metadata ── */}
        {run && (
          <div className="rounded-xl border border-[#ebebeb] dark:border-[#232323]
            bg-white dark:bg-[#171717] px-3 py-3 sm:px-5 sm:py-4 flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#aaa] dark:text-[#555]">
              Run info
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {[
                ["Started at",   fmtDate(run.started_at)],
                ["Finished at",  fmtDate(run.finished_at)],
                ["Trigger type", run.trigger_type],
                ["Version ID",   run.version_id ?? "—"],
                ["Workflow ID",  run.workflow_id],
                ["Run ID",       run.run_id],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-2">
                  <span className="text-[11.5px] text-[#aaa] dark:text-[#555] min-w-[90px] flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-[11.5px] font-mono text-[#444] dark:text-[#999] break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <JsonBlock label="Trigger data" value={run.trigger_data} />

            {run.error && (
              <div className="flex items-start gap-2 p-3 rounded-lg mt-1
                bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800">
                <TbAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-red-600 dark:text-red-400">{run.error}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Node logs ── */}
        <div className="rounded-2xl border border-[#ebebeb] dark:border-[#232323]
          overflow-hidden bg-white dark:bg-[#171717]">
          {/* Header */}
          <div className="px-3 py-3 sm:px-5 border-b border-[#f0f0f0] dark:border-[#1d1d1d]
            bg-[#fafafa] dark:bg-[#1a1a1a]
            flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#aaa] dark:text-[#555]">
              Node Execution Logs
            </p>
            {!loading && (
              <p className="text-[11px] text-[#ccc] dark:text-[#444]">
                {logs.length} node{logs.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Loading skeletons — shown on initial load AND log page changes */}
          {logsLoading && [...Array(4)].map((_, i) => (
            <div key={i} className={`flex items-center gap-2 sm:gap-3 px-3 py-3 sm:px-5 sm:py-3.5 animate-pulse
              ${i < 3 ? "border-b border-[#f0f0f0] dark:border-[#1d1d1d]" : ""}`}>
              {/* Status icon placeholder */}
              <div className="w-[15px] h-[15px] rounded-full bg-[#ebebeb] dark:bg-[#272727] flex-shrink-0" />
              {/* Label + type */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="h-3 w-28 sm:w-36 rounded-full bg-[#ebebeb] dark:bg-[#272727]" />
                <div className="h-2.5 w-16 sm:w-20 rounded-full bg-[#f0f0f0] dark:bg-[#232323]" />
              </div>
              {/* Error summary placeholder — hidden on mobile */}
              <div className="h-2.5 w-32 sm:w-40 rounded-full bg-[#f0f0f0] dark:bg-[#232323] hidden sm:block" />
              {/* Duration */}
              <div className="h-3 w-10 sm:w-12 rounded-full bg-[#ebebeb] dark:bg-[#272727] flex-shrink-0" />
              {/* Chevron */}
              <div className="w-4 h-4 rounded bg-[#f0f0f0] dark:bg-[#232323] flex-shrink-0" />
            </div>
          ))}

          {/* Empty */}
          {!logsLoading && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-[13px] text-[#ccc] dark:text-[#444]">No node logs recorded for this run.</p>
            </div>
          )}

          {/* Log rows */}
          {!logsLoading && logs.map((log) => <LogRow key={log.log_id} log={log} />)}

          {/* Log pagination */}
          {!logsLoading && (logPage > 0 || hasNextLogPage) && (
            <div className="px-3 py-3 sm:px-5 flex items-center justify-end gap-1 border-t border-[#f0f0f0] dark:border-[#1d1d1d]">
              <button
                onClick={() => handleLogPageChange(logPage - 1)}
                disabled={logPage === 0}
                title="Previous page"
                className="w-7 h-7 flex items-center justify-center rounded-lg
                  text-[#888] dark:text-[#555]
                  hover:bg-[#ebebeb] dark:hover:bg-[#2a2a2a]
                  hover:text-[#111] dark:hover:text-white
                  disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <TbChevronLeft className="w-[14px] h-[14px]" />
              </button>
              <button
                onClick={() => handleLogPageChange(logPage + 1)}
                disabled={!hasNextLogPage}
                title="Next page"
                className="w-7 h-7 flex items-center justify-center rounded-lg
                  text-[#888] dark:text-[#555]
                  hover:bg-[#ebebeb] dark:hover:bg-[#2a2a2a]
                  hover:text-[#111] dark:hover:text-white
                  disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <TbChevronRight className="w-[14px] h-[14px]" />
              </button>
            </div>
          )}
        </div>

        {/* Back link */}
        {run?.workflow_id && (
          <Link
            to={ROUTES.GET_FUSE_RUNS_URL(run.workflow_id)}
            className="self-start text-[12px] text-[#aaa] dark:text-[#555]
              hover:text-[#555] dark:hover:text-[#888] transition-colors"
          >
            ← Back to run history
          </Link>
        )}
      </div>
      </div>
    </main>
  );
};

export default WorkflowRunDetailPage;
