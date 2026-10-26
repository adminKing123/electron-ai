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
  <div className="flex items-end justify-between mb-5 sm:mb-7">
    <h2 className="text-[19px] sm:text-[22px] font-semibold text-black dark:text-white tracking-tight leading-tight">
      Fuses
    </h2>
    <FusePrimaryButton icon={TbPlus} loading={creating} onClick={onCreate}>
      Create New
    </FusePrimaryButton>
  </div>
);

/** Skeleton loader — card list on mobile, table on desktop. */
const WorkflowsSkeletonLoader = ({ count = 6 }) => (
  <div className="rounded-lg border border-[#e3e5e8] dark:border-[#2a2a2a] bg-white dark:bg-[#171717]">
    {/* Mobile card skeletons */}
    <div className="md:hidden">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-4 py-3.5 ${i !== count - 1 ? "border-b border-[#f0f0f0] dark:border-[#212121]" : ""}`}
        >
          <div className="flex-1">
            <div className="skeleton h-3.5 w-40 rounded-md" />
            <div className="flex items-center gap-2 mt-2">
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="flex gap-1.5">
                {[...Array(3)].map((_, j) => <div key={j} className="skeleton w-4 h-4 rounded-md" />)}
              </div>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <div className="skeleton w-7 h-7 rounded-lg" />
            <div className="skeleton w-7 h-7 rounded-lg" />
          </div>
        </div>
      ))}
    </div>

    {/* Desktop table skeleton */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse">
        <thead>
          <tr className="border-b border-[#eef0f2] dark:border-[#252525] bg-[#f8f9fb] dark:bg-[#1a1a1a]">
            {["Name", "Time", "Nodes", "Status", ""].map((h, i) => (
              <th
                key={i}
                className={`px-4 py-2.5 text-left text-[11px] font-semibold text-[#9ca3af] dark:text-[#666] uppercase tracking-wide
                  ${h === "Nodes" ? "hidden md:table-cell" : h === "Time" ? "hidden sm:table-cell" : h === "Status" ? "text-right" : h === "" ? "text-right w-[120px]" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(count)].map((_, i) => (
            <tr key={i} className={i !== count - 1 ? "border-b border-[#eef0f2] dark:border-[#252525]" : ""}>
              <td className="px-4 py-2.5"><div className="skeleton h-3.5 w-36 rounded-md" /></td>
              <td className="px-4 py-2.5 hidden sm:table-cell"><div className="skeleton h-3 w-24 rounded-md" /></td>
              <td className="px-4 py-3.5 hidden md:table-cell">
                <div className="flex gap-2">
                  {[...Array(3)].map((_, j) => <div key={j} className="skeleton w-5 h-5 rounded-md" />)}
                </div>
              </td>
              <td className="px-4 py-2.5 text-right"><div className="skeleton h-2.5 w-2.5 rounded-full ml-auto" /></td>
              <td className="px-4 py-2.5">
                <div className="flex justify-end gap-2">
                  <div className="skeleton h-3 w-10 rounded-md" />
                  <div className="skeleton w-7 h-7 rounded-lg" />
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
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
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
