import CopyMessagePrompt from "./CopyMessagePrompt";

const MessagePromptActions = ({ handleCopy, handleEdit }) => {
  return (
    <div className="my-1 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <CopyMessagePrompt handleCopy={handleCopy} />
    </div>
  );
};

export default MessagePromptActions;
