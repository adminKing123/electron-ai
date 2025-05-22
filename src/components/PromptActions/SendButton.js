import { IoArrowUp, IoStop } from "react-icons/io5";
import useMessageStore from "../../store/useMessagesStore";
import usePromptStore, { useModelStore } from "../../store/usePromptStores";

const SendButton = ({ onClick }) => {
  const { process, setProcess } = useMessageStore();
  const { prompt } = usePromptStore();
  const { model } = useModelStore();
  const isGeneratingPrompt = process ? true : false;
  const disabled = !prompt.trim() || model === null ? true : false;

  const stopGeneration = () => {
    setProcess(null);
  };

  if (isGeneratingPrompt)
    return (
      <button
        onClick={stopGeneration}
        className="bg-[#ffffff] hover:bg-[#C1C1C1] disabled:opacity-50 p-2 rounded-full"
      >
        <IoStop />
      </button>
    );
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-[#ffffff] hover:bg-[#C1C1C1] disabled:opacity-50 p-2 rounded-full"
    >
      <IoArrowUp />
    </button>
  );
};

export default SendButton;
