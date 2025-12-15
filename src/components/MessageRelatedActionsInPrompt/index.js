import CONFIG from "../../config";
import usePromptStore from "../../store/usePromptStores";
import AttachFilesPreview from "./AttachFilesPreview";
import MessageBeingEdited from "./MessageBeingEdited";

function MessageRelatedActionsInPrompt({ fileInputRef }) {
  const action = usePromptStore((state) => state.action);
  return (
    <>
      {action?.type === CONFIG.PROMPT_ACTION_TYPES.EDIT ? (
        <MessageBeingEdited action={action} />
      ) : null}
      <AttachFilesPreview fileInputRef={fileInputRef} />
    </>
  );
}

export default MessageRelatedActionsInPrompt;
