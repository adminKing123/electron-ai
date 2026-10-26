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
  TbBolt,
  TbCalendarTime,
  TbWebhook,
  TbActivity,
  TbChevronLeft,
  TbChevronRight,
} from "react-icons/tb";
import { iconBtnCls } from "../components/Fuse/FuseStudioHeader";
import { getWorkflowByIdAPI, getWorkflowRunsAPI } from "../apis/fuse/queryFunctions";
import useLiveDuration from "../hooks/useLiveDuration";
import useFuseWorkflowRunsLive from "../hooks/useFuseWorkflowRunsLive";
import HeaderUserProfile from "../components/HeaderUserProfile";
import ROUTES from "../router/routes";
import {
  FUSE_LIST_TABLE_WRAP,
  FUSE_LIST_TH,
  FUSE_LIST_TD,
  FUSE_LIST_ROW,
  FUSE_LIST_LINK,
  fmtListingTime,
  fmtListingDuration,
  fmtRunIdLink,
  FuseListingStatusDot,
  FuseListingViewLink,
  FuseListingTableFooter,
  FuseListingTableHead,
} from "../components/Fuse/fuseListingTable";

const PAGE_SIZE = 20;

// ─── Sub-components ────────────────────────────────────────────────────────────

const RunDurationCell = ({ run }) => {
  const liveMs = useLiveDuration(
    run.started_at,
    run.status === "running",
    run.duration_ms
  );
  return (
    <span className="text-[#6b7280] dark:text-[#888] tabular-nums">{fmtListingDuration(liveMs)}</span>
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
  <tr className={`animate-pulse ${FUSE_LIST_ROW}`}>
    <td className={FUSE_LIST_TD}><div className="h-3 w-12 rounded bg-[#ebebeb] dark:bg-[#272727]" /></td>
    <td className={FUSE_LIST_TD}><div className="h-3 w-24 rounded bg-[#ebebeb] dark:bg-[#272727]" /></td>
    <td className={`${FUSE_LIST_TD} hidden sm:table-cell`}><div className="h-3 w-20 rounded bg-[#ebebeb] dark:bg-[#272727]" /></td>
    <td className={`${FUSE_LIST_TD} hidden md:table-cell`}><div className="h-3 w-32 rounded bg-[#ebebeb] dark:bg-[#272727]" /></td>
    <td className={`${FUSE_LIST_TD} text-right`}><div className="h-3 w-12 rounded bg-[#ebebeb] dark:bg-[#272727] ml-auto" /></td>
    <td className={`${FUSE_LIST_TD} text-right`}><div className="h-2.5 w-2.5 rounded-full bg-[#ebebeb] dark:bg-[#272727] ml-auto" /></td>
    <td className={`${FUSE_LIST_TD} text-right`}><div className="h-3 w-10 rounded bg-[#ebebeb] dark:bg-[#272727] ml-auto" /></td>
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

  useFuseWorkflowRunsLive(workflowId, page, setRuns);

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
      <div className="flex-1 overflow-y-auto bg-[#f7f7f7] dark:bg-[#1a1a1a]">
      <div className="px-3 py-4 sm:px-6 sm:py-6 max-w-6xl mx-auto">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20
            border border-red-200 dark:border-red-800
            text-[13px] text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Table — send-logs style reference */}
        <div className={FUSE_LIST_TABLE_WRAP}>
          <table className="w-full min-w-[640px] border-collapse">
            <FuseListingTableHead>
              <th className={FUSE_LIST_TH}>ID</th>
              <th className={FUSE_LIST_TH}>Time</th>
              <th className={`${FUSE_LIST_TH} hidden sm:table-cell`}>Trigger</th>
              <th className={`${FUSE_LIST_TH} hidden md:table-cell`}>Subject</th>
              <th className={`${FUSE_LIST_TH} text-right hidden sm:table-cell`}>Duration</th>
              <th className={`${FUSE_LIST_TH} text-right`}>Status</th>
              <th className={`${FUSE_LIST_TH} text-right w-[72px]`} />
            </FuseListingTableHead>
            <tbody>
              {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

              {!loading && runs.length === 0 && (
                <tr>
                  <td colSpan={7}><EmptyState /></td>
                </tr>
              )}

              {!loading && runs.map((run) => {
                const openRun = () => navigate(ROUTES.GET_FUSE_RUN_DETAIL_URL(run.run_id));
                const subject =
                  run.error_message?.trim() ||
                  (run.status === "failed" ? "Workflow run failed" : workflow?.name || "Workflow run");

                return (
                  <tr key={run.run_id} className={FUSE_LIST_ROW}>
                    <td className={FUSE_LIST_TD}>
                      <button
                        type="button"
                        className={FUSE_LIST_LINK}
                        title={run.run_id}
                        onClick={openRun}
                      >
                        {fmtRunIdLink(run.run_id)}
                      </button>
                    </td>
                    <td className={`${FUSE_LIST_TD} text-[#6b7280] dark:text-[#888] tabular-nums whitespace-nowrap`}>
                      {fmtListingTime(run.started_at)}
                    </td>
                    <td className={`${FUSE_LIST_TD} hidden sm:table-cell`}>
                      <TriggerBadge type={run.trigger_type} />
                    </td>
                    <td className={`${FUSE_LIST_TD} hidden md:table-cell max-w-[240px]`}>
                      <span className="font-semibold text-[#111] dark:text-white truncate block" title={subject}>
                        {subject}
                      </span>
                    </td>
                    <td className={`${FUSE_LIST_TD} text-right hidden sm:table-cell`}>
                      <RunDurationCell run={run} />
                    </td>
                    <td className={`${FUSE_LIST_TD} text-right`}>
                      <div className="flex justify-end">
                        <FuseListingStatusDot status={run.status} />
                      </div>
                    </td>
                    <td className={`${FUSE_LIST_TD} text-right`}>
                      <FuseListingViewLink onClick={openRun} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && runs.length > 0 && (
            <FuseListingTableFooter count={runs.length} singular="run" plural="runs" />
          )}
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
