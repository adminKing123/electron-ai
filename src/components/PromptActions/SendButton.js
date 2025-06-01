import { IoArrowUp, IoStop } from "react-icons/io5";
import { useProcessController } from "../../store/useMessagesStore";
import usePromptStore, { useModelStore } from "../../store/usePromptStores";

const SendButton = ({ onClick }) => {
  const process = useProcessController((state) => state.process);
  const setProcess = useProcessController((state) => state.setProcess);
  const prompt = usePromptStore((state) => state.prompt);
  const model = useModelStore((state) => state.model);
  const isGeneratingPrompt = process ? true : false;
  const disabled = !prompt.trim() || model === null ? true : false;

  const stopGeneration = () => {
    setProcess(null);
  };

  if (isGeneratingPrompt)
    return (
      <button
        onClick={stopGeneration}
        className="bg-black dark:bg-[#ffffff] hover:bg-[#4C4C4C] dark:hover:bg-[#C1C1C1] disabled:opacity-50 p-2 rounded-full"
      >
        <IoStop className="text-white dark:text-black" />
      </button>
    );
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-black dark:bg-[#ffffff] hover:bg-[#4C4C4C] dark:hover:bg-[#C1C1C1] disabled:opacity-50 p-2 rounded-full"
    >
      <IoArrowUp className="text-white dark:text-black" />
    </button>
  );
};

export default SendButton;
