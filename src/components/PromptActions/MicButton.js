import { BsMic } from "react-icons/bs";
import { PiCheck, PiX } from "react-icons/pi";
import { useEffect, useRef } from "react";
import usePromptStore, { useMicStore } from "../../store/usePromptStores";
import api from "../../apis";
import ENDPOINTS from "../../apis/endpoints";
import {
  createDeepgramLiveSession,
  isDeepgramSttSupported,
} from "../../utils/deepgramLiveStt";

const MicButton = () => {
  const isRecording = useMicStore((state) => state.isRecording);
  const setIsRecording = useMicStore((state) => state.setIsRecording);
  const setRecordedText = useMicStore((state) => state.setRecordedText);

  const sessionRef = useRef(null);
  const startingRef = useRef(false);

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.stop();
      sessionRef.current = null;
    }
  };

  const handleStart = async () => {
    if (startingRef.current || isRecording) return;
    startingRef.current = true;

    stopSession();
    setRecordedText("");

    try {
      const { data } = await api({
        method: "get",
        url: ENDPOINTS.STT_DEEPGRAM_LIVE_CONFIG,
      });

      const session = createDeepgramLiveSession({
        listenUrl: data.listenUrl,
        token: data.token,
        params: data.params,
        onTranscript: (text) => setRecordedText(text),
        onError: (err) => {
          console.error("[STT]", err);
          setRecordedText("");
          setIsRecording(false);
          stopSession();
        },
      });

      sessionRef.current = session;
      setIsRecording(true);
      await session.start();
    } catch (error) {
      console.error("[STT] Failed to start recording:", error);
      setRecordedText("");
      setIsRecording(false);
      stopSession();
    } finally {
      startingRef.current = false;
    }
  };

  const handleCancel = () => {
    stopSession();
    setRecordedText("");
    setIsRecording(false);
  };

  const handlePass = () => {
    const recordedText = useMicStore.getState().recordedText;
    const prompt = usePromptStore.getState().prompt;
    const setPrompt = usePromptStore.getState().setPrompt;

    setPrompt(
      prompt +
        (prompt.length > 0 && !prompt.endsWith(" ") ? " " : "") +
        recordedText,
    );

    stopSession();
    setRecordedText("");
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      stopSession();
      setRecordedText("");
      setIsRecording(false);
    };
  }, [setRecordedText, setIsRecording]);

  if (!isDeepgramSttSupported()) {
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
