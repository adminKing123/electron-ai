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
      <div className="flex items-center gap-1">
        <button
          onClick={handleCancel}
          className="disabled:opacity-50 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <PiX className="text-black dark:text-white text-base" />
        </button>
        <button
          onClick={handlePass}
          className="disabled:opacity-50 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <PiCheck className="text-black dark:text-white text-base" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleStart}
      className="disabled:opacity-50 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <BsMic className="text-black dark:text-white text-base" />
    </button>
  );
};

export default MicButton;
