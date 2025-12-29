import { BsMic } from "react-icons/bs";
import { PiCheck, PiX } from "react-icons/pi";
import { useMicStore } from "../../store/usePromptStores";

const MicButton = () => {
  const isRecording = useMicStore((state) => state.isRecording);
  const setIsRecording = useMicStore((state) => state.setIsRecording);

  const handleStart = () => {
    setIsRecording(true);
  };

  const handleCancel = () => {
    setIsRecording(false);
  };

  const handlePass = () => {
    setIsRecording(false);
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={handleCancel} className="disabled:opacity-50 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
          <PiX className="text-black dark:text-white text-base" />
        </button>
        <button onClick={handlePass} className="disabled:opacity-50 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
          <PiCheck className="text-black dark:text-white text-base" />
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleStart} className="disabled:opacity-50 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
      <BsMic className="text-black dark:text-white text-base" />
    </button>
  );
};

export default MicButton;
