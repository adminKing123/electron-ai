import CopyMessagePrompt from "./CopyMessagePrompt";

const MessagePromptActions = ({ handleCopy }) => {
  return (
    <div className="my-1 flex items-center justify-end text-[#5D5D5D] dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <CopyMessagePrompt handleCopy={handleCopy} />
    </div>
  );
};

export default MessagePromptActions;
