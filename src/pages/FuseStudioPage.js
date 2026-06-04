import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FuseStudioHeader, FuseStudioSidebar, WorkflowCanvas, NodeConfigPanel } from "../components/Fuse";
import {
  getWorkflowByIdAPI,
  updateWorkflowNameAPI,
} from "../apis/fuse/queryFunctions";
import useCreateWorkflow from "../hooks/useCreateWorkflow";

export default function FuseStudioPage() {
  const { id } = useParams();

  const [workflowName, setWorkflowName] = useState("");
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);

  const committedName = useRef("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getWorkflowByIdAPI(id)
      .then((wf) => {
        if (cancelled) return;
        const name = wf.name ?? "Untitled Workflow";
        setWorkflowName(name);
        committedName.current = name;
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleNameBlur = useCallback(async () => {
    const trimmed = workflowName.trim() || "Untitled Workflow";
    if (!workflowName.trim()) setWorkflowName("Untitled Workflow");
    if (trimmed === committedName.current) return;

    setSaving(true);
    try {
      await updateWorkflowNameAPI(id, trimmed);
      committedName.current = trimmed;
    } catch {
      setWorkflowName(committedName.current);
    } finally {
      setSaving(false);
    }
  }, [id, workflowName]);

  const [selectedNode, setSelectedNode] = useState(null);

  const { creating, handleCreate } = useCreateWorkflow();

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
      <FuseStudioHeader
        name={loading ? "" : workflowName}
        onNameChange={setWorkflowName}
        onNameBlur={handleNameBlur}
        saving={saving}
      />
      <div className="flex-1 flex">
        <FuseStudioSidebar
          creating={creating}
          onCreate={handleCreate}
        />
        <div className="flex-1 flex gap-2.5 rounded-xl p-4 mb-3 mr-3
          bg-[#f7f7f7] dark:bg-[#1a1a1a]
          border border-[#e5e5e5] dark:border-[#252525]
          shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]">

          <WorkflowCanvas className="flex-1" onNodeClick={setSelectedNode} />
          <NodeConfigPanel
            className="flex-1 rounded-xl max-w-[550px] bg-white dark:bg-[#212121] border border-[#e5e5e5] dark:border-[#2a2a2a] shadow-sm"
            selectedNode={selectedNode}
          />
          </div>
      </div>
    </main>
  );
}
