import React, { useState, useEffect, useCallback } from "react";
import { TbPlus, TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  WorkflowsTable,
  FusePrimaryButton,
  FuseStudioSidebar,
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

const WorkflowsHeading = ({ loading, creating, onCreate }) => (
  <div className="flex items-end justify-between mb-5 sm:mb-7">
    <div>
      <h2 className="text-[19px] sm:text-[22px] font-semibold text-black dark:text-white tracking-tight leading-tight">
        Workflows
      </h2>
    </div>

    <FusePrimaryButton icon={TbPlus} loading={creating} onClick={onCreate}>
      Create New
    </FusePrimaryButton>
  </div>
);

const WorkflowsSkeletonLoader = () => (
  <div className="rounded-2xl border border-[#ebebeb] dark:border-[#232323] overflow-hidden bg-white dark:bg-[#1a1a1a] animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className={`flex items-center gap-3 px-3 sm:px-5 py-4
          ${i !== 2 ? "border-b border-[#f0f0f0] dark:border-[#1d1d1d]" : ""}`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a] flex-shrink-0" />
        <div className="h-3 w-32 sm:w-40 rounded-full bg-[#ebebeb] dark:bg-[#272727]" />
        <div className="h-3 w-16 rounded-full bg-[#ebebeb] dark:bg-[#272727] ml-auto hidden sm:block" />
        <div className="h-5 w-16 rounded-full bg-[#ebebeb] dark:bg-[#272727]" />
        <div className="h-3 w-14 rounded-full bg-[#ebebeb] dark:bg-[#272727]" />
      </div>
    ))}
  </div>
);

export default function FusesPageListing() {
  const navigate = useNavigate();
  const { creating, handleCreate } = useCreateWorkflow();

  // Each page is fetched independently; cursors stored per page index.
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Cursor-based pagination state
  const [page, setPage] = useState(0); // current 0-based page
  const [cursors, setCursors] = useState([null]); // cursors[i] = next_cursor to fetch page i
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchPage = useCallback(async (pageIndex, cursorList) => {
    setLoading(true);
    const cursor = cursorList[pageIndex]; // null for page 0
    const params = { limit: PAGE_SIZE };
    if (cursor) {
      params.after_created_at = cursor.after_created_at;
      params.after_id = cursor.after_id;
    }
    try {
      const { items, next_cursor } = await getWorkflowsAPI(params);
      setWorkflows(items ?? []);
      setHasNextPage(!!next_cursor);
      // Store the cursor for the NEXT page if we don't have it yet
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

  // Fetch whenever the page index changes
  useEffect(() => {
    fetchPage(page, cursors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  /* -- Handlers -- */
  const handleEdit = (wf) => navigate(ROUTES.GET_FUSE_STUDIO_URL(wf.id));
  const handleDelete = (wf) => setDeleteTarget(wf);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteWorkflowAPI(deleteTarget.id);
      // Refresh current page after delete
      fetchPage(page, cursors);
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
      <Header type="fuse" backRoute={ROUTES.FUSE} />

      {/* Confirmation dialog — rendered at root level so it overlays everything */}
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
      <div className="flex-1 flex overflow-y-hidden">
        <FuseStudioSidebar creating={creating} onCreate={handleCreate} />
        <div
          className="flex-1 overflow-y-auto rounded-xl p-4 mb-3 mr-3
            bg-[#f7f7f7] dark:bg-[#1a1a1a]
            border border-[#e5e5e5] dark:border-[#252525]
            shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]"
        >
          <div className="max-w-[860px] mx-auto px-3 py-6 sm:px-6 sm:py-10">
            {loading ? (
              <WorkflowsSkeletonLoader />
            ) : (
              <>
                <WorkflowsTable
                  workflows={workflows}
                  deletingId={deletingId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                {/* Prev / Next — Firestore cursor pagination has no total count */}
                {(page > 0 || hasNextPage) && (
                  <div className="mt-4 flex items-center justify-end gap-1">
                    <button
                      onClick={() => handlePageChange(page - 1)}
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
                      onClick={() => handlePageChange(page + 1)}
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
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
