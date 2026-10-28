import React, { useState, useEffect, useCallback } from "react";
import { TbPlus } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import {
  WorkflowsTable,
  FusePrimaryButton,
  FusePageShell,
} from "../components/Fuse";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import {
  getWorkflowsAPI,
  deleteWorkflowAPI,
} from "../apis/fuse/queryFunctions";
import useCreateWorkflow from "../hooks/useCreateWorkflow";
import ROUTES from "../router/routes";

/* Number of workflows fetched per page from the API. */
const PAGE_SIZE = 20;

const WorkflowsHeading = ({ creating, onCreate }) => (
  <div className="pb-6 mb-6 border-b border-ink-100 dark:border-void-800 flex items-end justify-between gap-4 flex-wrap">
    <div>
      <h1 className="text-[24px] md:text-[28px] font-bold tracking-tight text-ink-975 dark:text-white leading-tight">
        Fuses
      </h1>
      <p className="text-[14px] text-ink-500 dark:text-ink-500 mt-1">
        Create, manage and monitor your automations
      </p>
    </div>
    <FusePrimaryButton icon={TbPlus} loading={creating} onClick={onCreate} className="h-10">
      Create New
    </FusePrimaryButton>
  </div>
);

/** Skeleton loader ? card list on mobile, table on desktop. */
const WorkflowsSkeletonLoader = ({ count = 6 }) => (
  <div className="rounded-2xl border border-ink-150 dark:border-void-800 bg-white dark:bg-void-850 overflow-hidden">
    {/* Mobile card skeletons */}
    <div className="md:hidden">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-4 py-3.5 ${i !== count - 1 ? "border-b border-ink-100 dark:border-void-800" : ""}`}
        >
          <div className="flex-1">
            <div className="skeleton h-3.5 w-40 rounded-md" />
            <div className="flex items-center gap-2.5 mt-2">
              <div className="skeleton h-5 w-16 rounded-full" />
              {[...Array(3)].map((_, j) => <div key={j} className="skeleton w-5 h-5 rounded-md" />)}
            </div>
          </div>
          <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
        </div>
      ))}
    </div>

    {/* Desktop table skeleton */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-ink-100 dark:border-void-800 bg-ink-25/60 dark:bg-void-850">
            {[
              ["Name", ""],
              ["Steps", "w-[200px]"],
              ["Last updated", "w-[140px]"],
              ["Status", "w-[120px]"],
              ["", "w-[130px]"],
            ].map(([h, w], i) => (
              <th
                key={i}
                className={`px-5 py-3 text-left text-[12px] font-medium text-ink-500 dark:text-ink-500 whitespace-nowrap ${w}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(count)].map((_, i) => (
            <tr key={i} className={i !== count - 1 ? "border-b border-ink-100 dark:border-void-800" : ""}>
              <td className="px-5 py-3.5">
                <div className="skeleton h-3.5 w-44 rounded-md" />
              </td>
              <td className="px-5 py-3.5">
                <div className="flex gap-2">
                  {[...Array(3)].map((_, j) => <div key={j} className="skeleton w-5 h-5 rounded-md" />)}
                </div>
              </td>
              <td className="px-5 py-3.5"><div className="skeleton h-3 w-20 rounded-md" /></td>
              <td className="px-5 py-3.5"><div className="skeleton h-5 w-16 rounded-full" /></td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-1.5">
                  <div className="skeleton h-8 w-16 rounded-lg" />
                  <div className="skeleton w-8 h-8 rounded-lg" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function FusesPageListing() {
  const navigate = useNavigate();
  const { creating, handleCreate } = useCreateWorkflow();

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Cursor-based pagination state
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState([null]);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchPage = useCallback(async (pageIndex, cursorList) => {
    setLoading(true);
    const cursor = cursorList[pageIndex];
    const params = { limit: PAGE_SIZE };
    if (cursor) {
      params.after_created_at = cursor.after_created_at;
      params.after_id = cursor.after_id;
    }
    try {
      const { items, next_cursor } = await getWorkflowsAPI(params);
      setWorkflows(items ?? []);
      setHasNextPage(!!next_cursor);
      if (next_cursor) {
        setCursors((prev) => {
          const updated = [...prev];
          updated[pageIndex + 1] = next_cursor;
          return updated;
        });
      }
    } catch {
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(page, cursors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleEdit = (wf) => navigate(ROUTES.GET_FUSE_STUDIO_URL(wf.id));
  const handleDelete = (wf) => setDeleteTarget(wf);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteWorkflowAPI(deleteTarget.id);
      fetchPage(page, cursors);
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <FusePageShell
      backRoute={ROUTES.FUSE}
      creating={creating}
      onCreate={handleCreate}
      dialog={
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete workflow"
          message={`"${deleteTarget?.name}" will be permanently deleted. This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          loading={!!deletingId}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      }
    >
      <div className="max-w-[1080px] mx-auto px-4 pt-6 pb-12 sm:px-8 sm:pt-10">
        <WorkflowsHeading creating={creating} onCreate={handleCreate} />
        {loading ? (
          <WorkflowsSkeletonLoader count={6} />
        ) : (
          <>
            <WorkflowsTable
              workflows={workflows}
              deletingId={deletingId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              page={page}
              hasNextPage={hasNextPage}
              onPrevPage={() => setPage((p) => p - 1)}
              onNextPage={() => setPage((p) => p + 1)}
            />
          </>
        )}
      </div>
    </FusePageShell>
  );
}
