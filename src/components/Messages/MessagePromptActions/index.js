import CopyMessagePrompt from "./CopyMessagePrompt";
import EditMessagePrompt from "./EditMessagePrompt";

const MessagePromptActions = ({ handleCopy, handleEdit }) => {
  return (
    <div className="my-1 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <CopyMessagePrompt handleCopy={handleCopy} />
      <EditMessagePrompt handleEdit={handleEdit} />
    </div>
  );
};

export default MessagePromptActions;
