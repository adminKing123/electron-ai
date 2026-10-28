/**
 * WorkflowRunsPage.js
 * --------------------
 * Displays the trigger history (all runs) for a single workflow.
 *
 * Route: /fuse/studio/:id/runs
 * Each row links to WorkflowRunDetailPage for the per-node logs.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { LuArrowUpRight } from "react-icons/lu";
import {
  TbRefresh,
  TbBolt,
  TbCalendarTime,
  TbWebhook,
  TbActivity,
} from "react-icons/tb";
import { iconBtnCls } from "../components/Fuse/FuseStudioHeader";
import { getWorkflowByIdAPI, getWorkflowRunsAPI } from "../apis/fuse/queryFunctions";
import useLiveDuration from "../hooks/useLiveDuration";
import useFuseWorkflowRunsLive from "../hooks/useFuseWorkflowRunsLive";
import HeaderUserProfile from "../components/HeaderUserProfile";
import { RunStatusBadge } from "../components/Fuse/fuseRunFormatters";
import ROUTES from "../router/routes";
import {
  FUSE_LIST_TABLE_WRAP,
  FUSE_LIST_TH,
  FUSE_LIST_TD,
  FUSE_LIST_ROW,
  fmtListingTime,
  fmtListingDuration,
  fmtRunIdLink,
  FuseListingTableFooter,
  FuseListingTableHead,
} from "../components/Fuse/fuseListingTable";

const PAGE_SIZE = 20;

const OPEN_CLS =
  "inline-flex items-center gap-1 h-8 px-3 rounded-lg text-[12px] font-semibold " +
  "border border-ink-150 dark:border-void-750 bg-white dark:bg-void-800 " +
  "text-ink-750 dark:text-ink-200 hover:border-brand-200 dark:hover:border-brand-900 " +
  "hover:text-brand-700 dark:hover:text-white transition-colors";

// --- Sub-components ------------------------------------------------------------

const RunDurationCell = ({ run }) => {
  const liveMs = useLiveDuration(
    run.started_at,
    run.status === "running",
    run.duration_ms
  );
  return (
    <span className="text-ink-550 dark:text-ink-500 tabular-nums">{fmtListingDuration(liveMs)}</span>
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
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-600 dark:text-ink-400">
      <Icon className="w-[14px] h-[14px] text-ink-500 dark:text-ink-500" />
      {label}
    </span>
  );
};

const runSubject = (run, workflowName) =>
  run.error_message?.trim() ||
  (run.status === "failed" ? "Workflow run failed" : workflowName || "Workflow run");

const OpenButton = ({ onClick }) => (
  <button type="button" onClick={onClick} className={OPEN_CLS}>
    Open
    <LuArrowUpRight className="w-3.5 h-3.5" />
  </button>
);

const SkeletonListItem = () => (
  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-ink-100 dark:border-void-800 last:border-b-0">
    <div className="flex-1 min-w-0">
      <div className="skeleton h-3.5 w-40 rounded-md" />
      <div className="skeleton h-3 w-24 rounded-md mt-2" />
    </div>
    <div className="skeleton h-5 w-16 rounded-full" />
    <div className="skeleton h-8 w-16 rounded-lg" />
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-ink-100 dark:border-void-800 last:border-b-0">
    <td className="px-5 py-3.5">
      <div className="skeleton h-3.5 w-44 rounded-md" />
      <div className="skeleton h-3 w-16 rounded-md mt-2" />
    </td>
    <td className="px-5 py-3.5"><div className="skeleton h-3 w-20 rounded-md" /></td>
    <td className="px-5 py-3.5"><div className="skeleton h-3 w-24 rounded-md" /></td>
    <td className="px-5 py-3.5"><div className="skeleton h-3 w-12 rounded-md" /></td>
    <td className="px-5 py-3.5"><div className="skeleton h-5 w-16 rounded-full" /></td>
    <td className="px-5 py-3.5">
      <div className="flex justify-end">
        <div className="skeleton h-8 w-16 rounded-lg" />
      </div>
    </td>
  </tr>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center select-none">
    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
      <TbActivity className="w-6 h-6 text-brand-600 dark:text-brand-400" />
    </div>
    <p className="text-[15px] font-semibold text-ink-975 dark:text-white">
      No runs yet
    </p>
    <p className="text-[13px] text-ink-500 dark:text-ink-500 mt-1 max-w-xs">
      Activate the workflow and trigger it to see history here.
    </p>
  </div>
);

const RunListItem = ({ run, workflowName, onOpen, isLast }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3.5
      ${!isLast ? "border-b border-ink-100 dark:border-void-800" : ""}`}
  >
    <button type="button" onClick={onOpen} className="flex-1 min-w-0 text-left">
      <p className="text-[14px] font-semibold text-ink-975 dark:text-white truncate">
        {runSubject(run, workflowName)}
      </p>
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <span className="text-[12px] font-medium text-ink-450 dark:text-ink-550 tabular-nums">
          {fmtRunIdLink(run.run_id)}
        </span>
        <span className="text-ink-200 dark:text-void-650">·</span>
        <span className="text-[12px] text-ink-500 dark:text-ink-500 tabular-nums">
          {fmtListingTime(run.started_at)}
        </span>
      </div>
    </button>
    <RunStatusBadge status={run.status} />
    <OpenButton onClick={onOpen} />
  </div>
);

const RunRow = ({ run, workflowName, onOpen }) => (
  <tr className={`${FUSE_LIST_ROW} group`}>
    <td className={FUSE_LIST_TD}>
      <button type="button" onClick={onOpen} className="min-w-0 text-left max-w-[320px]">
        <span
          className="block text-[14px] font-semibold text-ink-975 dark:text-white truncate
            group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors"
          title={runSubject(run, workflowName)}
        >
          {runSubject(run, workflowName)}
        </span>
        <span className="block text-[12px] text-ink-450 dark:text-ink-550 tabular-nums mt-0.5" title={run.run_id}>
          {fmtRunIdLink(run.run_id)}
        </span>
      </button>
    </td>
    <td className={FUSE_LIST_TD}>
      <TriggerBadge type={run.trigger_type} />
    </td>
    <td className={`${FUSE_LIST_TD} text-ink-550 dark:text-ink-500 tabular-nums whitespace-nowrap`}>
      {fmtListingTime(run.started_at)}
    </td>
    <td className={FUSE_LIST_TD}>
      <RunDurationCell run={run} />
    </td>
    <td className={FUSE_LIST_TD}>
      <RunStatusBadge status={run.status} />
    </td>
    <td className={`${FUSE_LIST_TD} text-right`}>
      <div className="flex justify-end">
        <OpenButton onClick={onOpen} />
      </div>
    </td>
  </tr>
);

// --- Main page -----------------------------------------------------------------

const WorkflowRunsPage = () => {
  const { id: workflowId } = useParams();
  const navigate = useNavigate();

  const [workflow,    setWorkflow]    = useState(null);
  const [runs,        setRuns]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState(null);

  // Cursor-based pagination â€” stored in a ref so fetchPage always reads the
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
    <main className="h-screen flex flex-col overflow-hidden bg-white dark:bg-void-875 bg-aurora-glow dark:bg-aurora-glow-dark text-ink-950 dark:text-white">
      {/* -- Header -- */}
      <header className="flex-shrink-0 bg-transparent
        border-b border-ink-150 dark:border-void-800">
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
              <p className="text-[15px] font-semibold tracking-tight text-ink-975 dark:text-white leading-tight">
                Runs
              </p>
              <p className="text-[12px] text-ink-500 dark:text-ink-500 truncate leading-tight mt-0.5">
                {workflow?.name ?? "..."}
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

      {/* -- Content -- */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1080px] mx-auto px-4 pt-6 pb-12 sm:px-8 sm:pt-8">
          <div className="pb-6 mb-6 border-b border-ink-100 dark:border-void-800 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[24px] md:text-[28px] font-bold tracking-tight text-ink-975 dark:text-white leading-tight">
                Run history
              </h1>
              <p className="text-[14px] text-ink-500 dark:text-ink-500 mt-1">
                Every trigger of this workflow, newest first
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13px] font-medium
                border border-ink-150 dark:border-void-800
                bg-white dark:bg-void-850 text-ink-750 dark:text-ink-200
                hover:bg-ink-50 dark:hover:bg-void-825
                transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <TbRefresh className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px]
              border border-red-200 dark:border-red-900/60
              bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className={FUSE_LIST_TABLE_WRAP}>
            <div className="md:hidden">
              {loading && [...Array(5)].map((_, i) => <SkeletonListItem key={i} />)}
              {!loading && runs.length === 0 && <EmptyState />}
              {!loading && runs.map((run, idx) => (
                <RunListItem
                  key={run.run_id}
                  run={run}
                  workflowName={workflow?.name}
                  onOpen={() => navigate(ROUTES.GET_FUSE_RUN_DETAIL_URL(run.run_id))}
                  isLast={idx === runs.length - 1}
                />
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <FuseListingTableHead>
                  <th className={FUSE_LIST_TH}>Run</th>
                  <th className={`${FUSE_LIST_TH} w-[140px]`}>Trigger</th>
                  <th className={`${FUSE_LIST_TH} w-[140px]`}>Started</th>
                  <th className={`${FUSE_LIST_TH} w-[100px]`}>Duration</th>
                  <th className={`${FUSE_LIST_TH} w-[140px]`}>Status</th>
                  <th className={`${FUSE_LIST_TH} w-[100px]`} />
                </FuseListingTableHead>
                <tbody>
                  {loading && [...Array(5)].map((_, i) => <SkeletonRow key={`d-${i}`} />)}

                  {!loading && runs.length === 0 && (
                    <tr>
                      <td colSpan={6}><EmptyState /></td>
                    </tr>
                  )}

                  {!loading && runs.map((run) => (
                    <RunRow
                      key={run.run_id}
                      run={run}
                      workflowName={workflow?.name}
                      onOpen={() => navigate(ROUTES.GET_FUSE_RUN_DETAIL_URL(run.run_id))}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && (runs.length > 0 || page > 0 || hasNextPage) && (
              <FuseListingTableFooter
                count={runs.length}
                singular="run"
                plural="runs"
                page={page}
                hasNextPage={hasNextPage}
                onPrev={() => setPage((p) => p - 1)}
                onNext={() => setPage((p) => p + 1)}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default WorkflowRunsPage;
