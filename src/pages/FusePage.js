import React, { useState, useEffect } from "react";
import { TbPlus } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { WorkflowsTable } from "../components/Fuse";
import {
  getWorkflowsAPI,
  createWorkflowAPI,
  deleteWorkflowAPI,
} from "../apis/fuse/queryFunctions";
import ROUTES from "../router/routes";

/* ─────────────────────────────────────────────────────────
   FusePage — standalone layout (no MainLayout / no Sidebar).
   Displays the user's Fuse workflows in a sortable table.
───────────────────────────────────────────────────────── */
export default function FusePage() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [creating, setCreating]     = useState(false);
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

  /* ── Handlers ── */
  const handleCreate = async () => {
    setCreating(true);
    try {
      const newWorkflow = await createWorkflowAPI({ name: "Untitled Workflow" });
      setWorkflows((prev) => [newWorkflow, ...prev]);
      navigate(ROUTES.GET_FUSE_STUDIO_URL(newWorkflow.id));
    } catch {
      /* TODO: surface error to user via toast */
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (wf) => {
    navigate(ROUTES.GET_FUSE_STUDIO_URL(wf.id));
  };

  const handleDelete = async (wf) => {
    if (!window.confirm(`Delete workflow "${wf.name}"?`)) return;
    setDeletingId(wf.id);
    await deleteWorkflowAPI(wf.id);
    setWorkflows((prev) => prev.filter((w) => w.id !== wf.id));
    setDeletingId(null);
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
      {/* ── Top bar ── */}
      <Header type="fuse" />

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto px-6 py-10">

          {/* ── Page heading row ── */}
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="text-[22px] font-semibold text-black dark:text-white tracking-tight leading-tight">
                Workflows
              </h2>
              <p className="text-xs text-[#aaa] dark:text-[#555] mt-1">
                {loading
                  ? "..."
                  : `${workflows.length} workflow${workflows.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Primary CTA */}
            <button
              onClick={handleCreate}
              disabled={creating}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl
                bg-[#111] dark:bg-[#f0f0f0]
                text-white dark:text-[#111]
                text-[13px] font-semibold
                hover:opacity-80 active:opacity-70
                transition-opacity duration-150 select-none
                disabled:cursor-not-allowed overflow-hidden"
            >
              {creating && (
                <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent" />
              )}
              <TbPlus className="w-4 h-4 flex-shrink-0" />
              Create New
            </button>
          </div>

          {/* ── Table ── */}
          {loading ? (
            /* Skeleton rows while loading */
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