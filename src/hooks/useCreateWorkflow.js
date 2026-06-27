import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkflowAPI, generateWorkflowAPI } from "../apis/fuse/queryFunctions";
import ROUTES from "../router/routes";

/**
 * useCreateWorkflow — reusable hook for creating a new Fuse workflow.
 *
 * Encapsulates the create API call + navigation to the studio page.
 * Pass a prompt string to generate a workflow with AI; omit it for a blank canvas.
 *
 * @returns {{ creating: boolean, handleCreate: (prompt?: string) => Promise<void> }}
 */
const useCreateWorkflow = () => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreate = async (prompt) => {
    const trimmed = typeof prompt === "string" ? prompt.trim() : "";

    setCreating(true);
    try {
      const newWorkflow = trimmed
        ? await generateWorkflowAPI({ prompt: trimmed })
        : await createWorkflowAPI({ name: "Untitled Workflow" });
      navigate(ROUTES.GET_FUSE_STUDIO_URL(newWorkflow.id));
    } catch {
      /* TODO: surface error to user via toast */
    } finally {
      setCreating(false);
    }
  };

  return { creating, handleCreate };
};

export default useCreateWorkflow;
