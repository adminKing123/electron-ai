import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkflowAPI } from "../apis/fuse/queryFunctions";
import ROUTES from "../router/routes";

/**
 * useCreateWorkflow — reusable hook for creating a new Fuse workflow.
 *
 * Encapsulates the create API call + navigation to the studio page.
 * Use this anywhere a "Create New Workflow" action is needed.
 *
 * @returns {{ creating: boolean, handleCreate: Function }}
 *
 * @example
 * const { creating, handleCreate } = useCreateWorkflow();
 * <FusePrimaryButton icon={TbPlus} loading={creating} onClick={handleCreate}>
 *   Create New
 * </FusePrimaryButton>
 */
const useCreateWorkflow = () => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const newWorkflow = await createWorkflowAPI({ name: "Untitled Workflow" });
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
