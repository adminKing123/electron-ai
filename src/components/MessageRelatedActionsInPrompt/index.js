import usePromptStore from "../../store/usePromptStores";
import MessageBeingEdited from "./MessageBeingEdited";

function MessageRelatedActionsInPrompt() {
  const action = usePromptStore((state) => state.action);

  if (action?.type === "EDIT") return <MessageBeingEdited action={action} />;
  return null;
}

export default MessageRelatedActionsInPrompt;
