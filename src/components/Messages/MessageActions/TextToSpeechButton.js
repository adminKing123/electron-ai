import { useEffect, useRef, useState } from "react";
import { RxSpeakerLoud } from "react-icons/rx";
import { MdStop } from "react-icons/md";
import api from "../../../apis";
import ENDPOINTS from "../../../apis/endpoints";
import { BasicLoader } from "../../Loaders";
import { getCopiableAnswer } from "../../../utils/getCopiableAnswer";

const TextToSpeechButton = ({ message }) => {
  const [status, setStatus] = useState("idle");

  const audioRef = useRef(null);
  const audioBlobUrlRef = useRef(null);

  const abortControllerRef = useRef(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.src = "";
        audioRef.current.load();
        audioRef.current = null;
      }

      if (audioBlobUrlRef.current) {
        URL.revokeObjectURL(audioBlobUrlRef.current);
        audioBlobUrlRef.current = null;
      }
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }

    if (audioBlobUrlRef.current) {
      URL.revokeObjectURL(audioBlobUrlRef.current);
      audioBlobUrlRef.current = null;
    }

    if (mountedRef.current) setStatus("idle");
  };

  const handleSpeak = async () => {
    if (status === "playing") {
      stopAudio();
      return;
    }

    const text = getCopiableAnswer(message?.answer);
    if (!text?.trim()) return;

    if (mountedRef.current) setStatus("loading");

    abortControllerRef.current = new AbortController();

    try {
      const response = await api({
        method: "post",
        url: ENDPOINTS.TTS_SPEAK,
        data: { text },
        responseType: "blob",
        signal: abortControllerRef.current.signal,
      });

      if (!mountedRef.current) return;

      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioBlobUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => stopAudio();
      audio.onerror = () => {
        console.error("[TTS] Audio playback error");
        stopAudio();
      };

      await audio.play();

      if (mountedRef.current) setStatus("playing");
    } catch (error) {
      if (error?.code === "ERR_CANCELED" || error?.name === "AbortError") return;

      console.error("[TTS] Failed to generate speech:", error);
      if (mountedRef.current) setStatus("idle");
    }
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={status === "loading"}
      title={status === "playing" ? "Stop speaking" : "Read aloud"}
      className="p-[6px] hover:bg-[#E8E8E8] dark:hover:bg-[#1d1d1d] rounded-md disabled:opacity-50"
    >
      {status === "loading" ? (
        <BasicLoader />
      ) : status === "playing" ? (
        <MdStop />
      ) : (
        <RxSpeakerLoud />
      )}
    </button>
  );
};

export default TextToSpeechButton;
