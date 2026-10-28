import { IoArrowUp, IoStop } from "react-icons/io5";
import { useProcessController } from "../../store/useMessagesStore";
import usePromptStore, { useFileInputStore, useMicStore, useModelStore } from "../../store/usePromptStores";

const SendButton = ({ onClick }) => {
  const process = useProcessController((state) => state.process);
  const setProcess = useProcessController((state) => state.setProcess);
  const prompt = usePromptStore((state) => state.prompt);
  const model = useModelStore((state) => state.model);
  const isGeneratingPrompt = Boolean(process);
  const isRecording = useMicStore((state) => state.isRecording);
  const disabled = !prompt.trim() || model === null ? true : false;

  const { attachedFiles } = useFileInputStore();
  
  const files = Object.values(attachedFiles);
  const any_file_uploading = files.some((file) => Boolean(file?.in_progress));

  const stopGeneration = () => {
    setProcess(null, null, true);
  };

  if (isRecording) return null;

  if (isGeneratingPrompt)
    return (
      <button
        onClick={stopGeneration}
        className="w-9 h-9 flex items-center justify-center rounded-xl
          bg-brand-600 dark:bg-brand-500 shadow-glow
          text-white dark:text-[var(--brand-on-solid)]
          hover:bg-brand-700 dark:hover:bg-brand-600
          transition-colors"
      >
        <IoStop className="w-[14px] h-[14px]" />
      </button>
    );
  return (
    <button
      onClick={onClick}
      disabled={disabled || any_file_uploading}
      className="w-9 h-9 flex items-center justify-center rounded-xl
        bg-brand-600 dark:bg-brand-500 shadow-glow
        text-white dark:text-[var(--brand-on-solid)]
        hover:bg-brand-700 dark:hover:bg-brand-600
        disabled:opacity-30 disabled:shadow-none
        transition-[background-color,opacity]"
    >
      <IoArrowUp className="w-[16px] h-[16px]" />
    </button>
  );
};

export default SendButton;
