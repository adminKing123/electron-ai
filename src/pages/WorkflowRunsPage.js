/**
 * WorkflowRunsPage.js
 * ────────────────────
 * Displays the trigger history (all runs) for a single workflow.
 *
 * Route: /fuse/studio/:id/runs
 * Each row links to WorkflowRunDetailPage for the per-node logs.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  TbRefresh,
  TbCircleCheck,
  TbCircleX,
  TbLoader2,
  TbBolt,
  TbCalendarTime,
  TbWebhook,
  TbActivity,
  TbChevronLeft,
  TbChevronRight,
} from "react-icons/tb";
import { iconBtnCls } from "../components/Fuse/FuseStudioHeader";
import { getWorkflowByIdAPI, getWorkflowRunsAPI } from "../apis/fuse/queryFunctions";
import HeaderUserProfile from "../components/HeaderUserProfile";
import ROUTES from "../router/routes";

const PAGE_SIZE = 20;

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Format an ISO-8601 string as a human-readable local date + time. */
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

/** Format duration_ms into a readable string. */
function fmtDuration(ms) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    success: {
      icon: TbCircleCheck,
      cls: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    },
    failed: {
      icon: TbCircleX,
      cls: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    },
    running: {
      icon: TbLoader2,
      cls: "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      spin: true,
    },
  };
  const { icon: Icon, cls, spin } = map[status] ?? map.failed;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>
      <Icon className={`w-3 h-3 ${spin ? "animate-spin" : ""}`} />
      {status}
    </span>
  );
};

const TriggerBadge = ({ type }) => {
  const map = {
    webhook:  { icon: TbWebhook,      label: "Webhook"  },
    schedule: { icon: TbCalendarTime, label: "Schedule" },
    manual:   { icon: TbBolt,         label: "Manual"   },
  };
  const { icon: Icon, label } = map[type] ?? { icon: TbBolt, label: type };
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-[#888] dark:text-[#555]">
      <Icon className="w-[13px] h-[13px]" />
      {label}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-[#f0f0f0] dark:border-[#1d1d1d]">
    <td className="px-3 sm:px-5 py-4"><div className="h-3 w-20 sm:w-24 rounded-full bg-[#ebebeb] dark:bg-[#272727]" /></td>
    <td className="px-3 sm:px-5 py-4"><div className="h-3 w-14 sm:w-16 rounded-full bg-[#ebebeb] dark:bg-[#272727]" /></td>
    <td className="px-3 sm:px-5 py-4 hidden sm:table-cell"><div className="h-3 w-36 rounded-full bg-[#ebebeb] dark:bg-[#272727] ml-auto" /></td>
    <td className="px-3 sm:px-5 py-4 hidden sm:table-cell"><div className="h-3 w-14 rounded-full bg-[#ebebeb] dark:bg-[#272727] ml-auto" /></td>
    <td className="px-3 sm:px-5 py-4"><div className="h-3 w-14 sm:w-16 rounded-full bg-[#ebebeb] dark:bg-[#272727] ml-auto" /></td>
  </tr>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <TbActivity className="w-10 h-10 text-[#d0d0d0] dark:text-[#333]" />
    <p className="text-[13px] font-medium text-[#bbb] dark:text-[#444]">
      No runs yet
    </p>
    <p className="text-[12px] text-[#ccc] dark:text-[#3a3a3a]">
      Activate the workflow and trigger it to see history here.
    </p>
  </div>
);

// ─── Main page ─────────────────────────────────────────────────────────────────

const WorkflowRunsPage = () => {
  const { id: workflowId } = useParams();
  const navigate = useNavigate();

  const [workflow,    setWorkflow]    = useState(null);
  const [runs,        setRuns]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState(null);

  // Cursor-based pagination — stored in a ref so fetchPage always reads the
  // latest cursor without stale-closure issues.
  const [page,        setPage]        = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const cursorsRef = useRef([null]); // cursorsRef.current[i] = next_cursor needed for page i

  const fetchPage = useCallback(async (pageIndex, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const cursor = cursorsRef.current[pageIndex];
    const params = { limit: PAGE_SIZE };
    if (cursor) {
      params.after_started_at = cursor.after_started_at;
      params.after_run_id     = cursor.after_run_id;
    }

    try {
      const [wf, result] = await Promise.all([
        getWorkflowByIdAPI(workflowId),
        getWorkflowRunsAPI(workflowId, params),
      ]);
      setWorkflow(wf);
      setRuns(result.items ?? []);
      setHasNextPage(!!result.next_cursor);
      if (result.next_cursor) {
        cursorsRef.current[pageIndex + 1] = result.next_cursor;
      }
    } catch {
      setError("Failed to load run history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [workflowId]);

  useEffect(() => { fetchPage(page); }, [page, fetchPage]);

  const handleRefresh = () => {
    cursorsRef.current = [null];
    if (page === 0) {
      fetchPage(0, true);
    } else {
      setPage(0); // triggers the effect which calls fetchPage(0)
    }
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
              onClick={() => navigate(ROUTES.GET_FUSE_STUDIO_URL(workflowId))}
              className={`${iconBtnCls} flex-shrink-0`}
              title="Back to studio"
            >
              <IoChevronBackOutline className="w-[18px] h-[18px]" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb] dark:text-[#555] leading-none mb-0.5">
                Run History
              </p>
              <p className="text-[14px] font-semibold tracking-tight text-[#111] dark:text-white truncate leading-tight">
                {workflow?.name ?? "…"}
              </p>
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
      <div className="px-3 py-4 sm:px-6 sm:py-6 max-w-5xl mx-auto">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20
            border border-red-200 dark:border-red-800
            text-[13px] text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#ebebeb] dark:border-[#232323] bg-white dark:bg-[#171717]">
          <table className="w-full min-w-[320px] border-collapse">
            <thead>
              <tr className="border-b border-[#f0f0f0] dark:border-[#1d1d1d] bg-[#fafafa] dark:bg-[#1a1a1a]">
                <th className="px-3 sm:px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#aaa] dark:text-[#555] whitespace-nowrap">Run ID</th>
                <th className="px-3 sm:px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#aaa] dark:text-[#555] whitespace-nowrap">Trigger</th>
                <th className="px-3 sm:px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#aaa] dark:text-[#555] whitespace-nowrap hidden sm:table-cell">Started</th>
                <th className="px-3 sm:px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#aaa] dark:text-[#555] whitespace-nowrap hidden sm:table-cell">Duration</th>
                <th className="px-3 sm:px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#aaa] dark:text-[#555] whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

              {!loading && runs.length === 0 && (
                <tr>
                  <td colSpan={5}><EmptyState /></td>
                </tr>
              )}

              {!loading && runs.map((run) => (
                <tr
                  key={run.run_id}
                  onClick={() => navigate(ROUTES.GET_FUSE_RUN_DETAIL_URL(run.run_id))}
                  className="border-b border-[#f6f6f6] dark:border-[#1c1c1c] last:border-b-0
                    hover:bg-[#fafafa] dark:hover:bg-[#1e1e1e]
                    transition-colors cursor-pointer"
                >
                  <td className="px-3 sm:px-5 py-4 font-mono text-[12px] text-[#555] dark:text-[#888] max-w-[90px] sm:max-w-[120px]">
                    <span title={run.run_id}>{run.run_id.slice(0, 8)}…</span>
                  </td>
                  <td className="px-3 sm:px-5 py-4">
                    <TriggerBadge type={run.trigger_type} />
                  </td>
                  <td className="px-3 sm:px-5 py-4 text-right text-[12px] text-[#666] dark:text-[#777] whitespace-nowrap hidden sm:table-cell">
                    {fmtDate(run.started_at)}
                  </td>
                  <td className="px-3 sm:px-5 py-4 text-right text-[12px] text-[#888] dark:text-[#555] font-mono whitespace-nowrap hidden sm:table-cell">
                    {fmtDuration(run.duration_ms)}
                  </td>
                  <td className="px-3 sm:px-5 py-4">
                    <div className="flex justify-end">
                      <StatusBadge status={run.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Prev / Next — cursor pagination, no total count available */}
        {!loading && (page > 0 || hasNextPage) && (
          <div className="mt-4 flex items-center justify-end gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              title="Previous page"
              className="w-8 h-8 flex items-center justify-center rounded-lg
                text-[#888] dark:text-[#555]
                hover:bg-[#ebebeb] dark:hover:bg-[#2a2a2a]
                hover:text-[#111] dark:hover:text-white
                disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <TbChevronLeft className="w-[16px] h-[16px]" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
              title="Next page"
              className="w-8 h-8 flex items-center justify-center rounded-lg
                text-[#888] dark:text-[#555]
                hover:bg-[#ebebeb] dark:hover:bg-[#2a2a2a]
                hover:text-[#111] dark:hover:text-white
                disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <TbChevronRight className="w-[16px] h-[16px]" />
            </button>
          </div>
        )}
      </div>
      </div>
    </main>
  );
};

export default WorkflowRunsPage;
