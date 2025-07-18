import CopyMessagePrompt from "./CopyMessagePrompt";
import EditMessagePrompt from "./EditMessagePrompt";

const MessagePromptActions = ({ handleCopy, handleEdit }) => {
  return (
    <div className="my-1 flex items-center justify-end text-[#5D5D5D] dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <EditMessagePrompt handleEdit={handleEdit} />
      <CopyMessagePrompt handleCopy={handleCopy} />
    </div>
  );
};

export default MessagePromptActions;
