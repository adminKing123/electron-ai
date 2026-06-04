import React, { useState, useEffect } from "react";
import { TbPlus } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { WorkflowsTable, FusePrimaryButton } from "../components/Fuse";
import {
  getWorkflowsAPI,
  deleteWorkflowAPI,
} from "../apis/fuse/queryFunctions";
import useCreateWorkflow from "../hooks/useCreateWorkflow";
import ROUTES from "../router/routes";

/* ---------------------------------------------------------
   Sub-components
--------------------------------------------------------- */

/**
 * Page heading row � title, workflow count, and Create New CTA.
 *
 * @param {object}   props
 * @param {number}   props.count    � total number of workflows
 * @param {boolean}  props.loading  � when true shows "�" instead of count
 * @param {boolean}  props.creating � disables button + plays shimmer sweep
 * @param {Function} props.onCreate � called when Create New is clicked
 */
const WorkflowsHeading = ({ count, loading, creating, onCreate }) => (
  <div className="flex items-end justify-between mb-7">
    <div>
      <h2 className="text-[22px] font-semibold text-black dark:text-white tracking-tight leading-tight">
        Workflows
      </h2>
      <p className="text-xs text-[#aaa] dark:text-[#555] mt-1">
        {loading ? "…" : `${count} workflow${count !== 1 ? "s" : ""}`}
      </p>
    </div>

    <FusePrimaryButton
      icon={TbPlus}
      loading={creating}
      onClick={onCreate}
    >
      Create New
    </FusePrimaryButton>
  </div>
);

/**
 * Animated placeholder shown while workflows are loading.
 * Renders 3 skeleton rows matching the table row layout.
 */
const WorkflowsSkeletonLoader = () => (
  <div className="rounded-2xl border border-[#ebebeb] dark:border-[#232323] overflow-hidden bg-white dark:bg-[#1a1a1a] animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className={`flex items-center gap-4 px-5 py-4
          ${i !== 2 ? "border-b border-[#f0f0f0] dark:border-[#1d1d1d]" : ""}`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
        <div className="h-3 w-40 rounded-full bg-[#ebebeb] dark:bg-[#272727]" />
        <div className="h-3 w-28 rounded-full bg-[#ebebeb] dark:bg-[#272727] ml-auto" />
        <div className="h-3 w-28 rounded-full bg-[#ebebeb] dark:bg-[#272727]" />
      </div>
    ))}
  </div>
);

/* ---------------------------------------------------------
   FusePage � standalone layout (no MainLayout / no Sidebar).
   Displays the user's Fuse workflows in a sortable table.
--------------------------------------------------------- */
export default function FusePage() {
  const navigate = useNavigate();
  const { creating, handleCreate } = useCreateWorkflow();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  /* Load workflows on mount */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getWorkflowsAPI()
      .then((data) => { if (!cancelled) setWorkflows(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* -- Handlers -- */
  const handleEdit = (wf) => navigate(ROUTES.GET_FUSE_STUDIO_URL(wf.id));

  const handleDelete = async (wf) => {
    if (!window.confirm(`Delete workflow "${wf.name}"?`)) return;
    setDeletingId(wf.id);
    await deleteWorkflowAPI(wf.id);
    setWorkflows((prev) => prev.filter((w) => w.id !== wf.id));
    setDeletingId(null);
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
      {/* -- Top bar -- */}
      <Header type="fuse" />

      {/* -- Scrollable content area -- */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto px-6 py-10">

          <WorkflowsHeading
            count={workflows.length}
            loading={loading}
            creating={creating}
            onCreate={handleCreate}
          />

          {loading ? (
            <WorkflowsSkeletonLoader />
          ) : (
            <WorkflowsTable
              workflows={workflows}
              deletingId={deletingId}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

        </div>
      </div>
    </main>
  );
}
