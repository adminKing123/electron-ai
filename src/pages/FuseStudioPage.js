import React from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";

/**
 * FuseStudioPage — the workflow builder canvas.
 *
 * Accessed via /fuse/studio/:id after creating or editing a workflow.
 * Full implementation (node editor, connections, etc.) is pending.
 */
export default function FuseStudioPage() {
  const { id } = useParams();

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
      {/* ── Top bar ── */}
      <Header type="fuse" />

      {/* ── Canvas placeholder ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 select-none">
        <h1 className="text-2xl font-semibold text-black dark:text-white tracking-tight">
          Fuse Studio
        </h1>
        <p className="text-xs text-[#aaa] dark:text-[#555]">
          Workflow&nbsp;
          <span className="font-mono text-[#888] dark:text-[#666]">{id}</span>
        </p>
      </div>
    </main>
  );
}
