import { BsMic } from "react-icons/bs";
import { PiCheck, PiX } from "react-icons/pi";
import usePromptStore, { useMicStore } from "../../store/usePromptStores";
import { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const MicButton = () => {
  const isRecording = useMicStore((state) => state.isRecording);
  const setIsRecording = useMicStore((state) => state.setIsRecording);
  const setRecordedText = useMicStore((state) => state.setRecordedText);

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const handleStart = () => {
    setRecordedText("");
    resetTranscript();
    setIsRecording(true);
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleCancel = () => {
    SpeechRecognition.stopListening();
    resetTranscript();
    setRecordedText("");
    setIsRecording(false);
  };

  const handlePass = () => {
    const recordedText = useMicStore.getState().recordedText;
    const prompt = usePromptStore.getState().prompt;
    const setPrompt = usePromptStore.getState().setPrompt;
    setPrompt(prompt + (prompt.length > 0 && !prompt.endsWith(" ") ? " " : "") + recordedText);
    SpeechRecognition.stopListening();
    setRecordedText("");
    setIsRecording(false);
  };

  useEffect(() => {
    if (isRecording && transcript) {
      setRecordedText(transcript);
    }
  }, [transcript, isRecording, setRecordedText]);

  useEffect(() => {
    return () => {
      SpeechRecognition.stopListening();
      resetTranscript();
      setRecordedText("");
      setIsRecording(false);
    };
  }, [setRecordedText, setIsRecording, resetTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-0.5">
        <button
          onClick={handleCancel}
          title="Cancel"
          className="w-7 h-7 flex items-center justify-center rounded-lg
            text-[#888] dark:text-[#888]
            hover:text-red-500 dark:hover:text-red-400
            hover:bg-[#ebebeb] dark:hover:bg-[#222]
            transition-colors"
        >
          <PiX className="w-[14px] h-[14px]" />
        </button>
        <button
          onClick={handlePass}
          title="Apply transcription"
          className="w-7 h-7 flex items-center justify-center rounded-lg
            text-[#888] dark:text-[#888]
            hover:text-[#111] dark:hover:text-white
            hover:bg-[#ebebeb] dark:hover:bg-[#222]
            transition-colors"
        >
          <PiCheck className="w-[14px] h-[14px]" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleStart}
      title="Speak"
      className="w-7 h-7 flex items-center justify-center rounded-lg
        text-[#888] dark:text-[#888]
        hover:text-[#111] dark:hover:text-white
        hover:bg-[#ebebeb] dark:hover:bg-[#222]
        transition-colors"
    >
      <BsMic className="w-[14px] h-[14px]" />
    </button>
  );
};

export default MicButton;
