import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FuseStudioHeader, FuseStudioSidebar } from "../components/Fuse";
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

  const { creating, handleCreate } = useCreateWorkflow();

  const handleAddNode = () => {
    /* TODO: open node picker / add node to canvas */
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
      <FuseStudioHeader
        name={loading ? "" : workflowName}
        onNameChange={setWorkflowName}
        onNameBlur={handleNameBlur}
        saving={saving}
      />
      <div className="flex-1 flex flex-col">
        <FuseStudioSidebar
          creating={creating}
          onCreate={handleCreate}
          onAddNode={handleAddNode}
        />
      </div>
    </main>
  );
}
