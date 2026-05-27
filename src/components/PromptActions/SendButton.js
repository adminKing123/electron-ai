import { IoArrowUp, IoStop } from "react-icons/io5";
import { useProcessController } from "../../store/useMessagesStore";
import usePromptStore, { useFileInputStore, useMicStore, useModelStore } from "../../store/usePromptStores";

const SendButton = ({ onClick }) => {
  const process = useProcessController((state) => state.process);
  const setProcess = useProcessController((state) => state.setProcess);
  const prompt = usePromptStore((state) => state.prompt);
  const model = useModelStore((state) => state.model);
  const isGeneratingPrompt = process ? true : false;
  const isRecording = useMicStore((state) => state.isRecording);
  const disabled = !prompt.trim() || model === null ? true : false;

  const { attachedFiles } = useFileInputStore();
  
  const files = Object.values(attachedFiles);
  const any_file_uploading = files.some((file) => file?.in_progress ? true : false);

  const stopGeneration = () => {
    setProcess(null, null, true);
  };

  if (isRecording) return null;

  if (isGeneratingPrompt)
    return (
      <button
        onClick={stopGeneration}
        className="w-8 h-8 flex items-center justify-center rounded-full
          bg-[#111] dark:bg-white
          hover:bg-[#333] dark:hover:bg-[#e0e0e0]
          transition-colors"
      >
        <IoStop className="w-[14px] h-[14px] text-white dark:text-[#111]" />
      </button>
    );
  return (
    <button
      onClick={onClick}
      disabled={disabled || any_file_uploading}
      className="w-8 h-8 flex items-center justify-center rounded-full
        bg-[#111] dark:bg-white
        hover:bg-[#333] dark:hover:bg-[#e0e0e0]
        disabled:opacity-30
        transition-colors"
    >
      <IoArrowUp className="w-[15px] h-[15px] text-white dark:text-[#111]" />
    </button>
  );
};

export default SendButton;
