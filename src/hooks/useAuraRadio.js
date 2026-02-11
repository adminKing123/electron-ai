import { useRef, useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useGetTrack } from "../apis/aura_rj/queryHooks";

const base64ToUrl = (base64) => {
  const arr = base64.split(",");
  const mime = arr[0]?.match(/:(.*?);/)?.[1] || "audio/mp3";
  const bstr = atob(arr[1] || base64);
  const u8 = new Uint8Array(bstr.length);

  for (let i = 0; i < bstr.length; i++) {
    u8[i] = bstr.charCodeAt(i);
  }

  return URL.createObjectURL(new Blob([u8], { type: mime }));
};

export const STATUS = {
  IDLE: "IDLE",
  STARTING: "STARTING",
  LOADING: "LOADING",
  BUFFERING: "BUFFERING",
  PLAYING: "PLAYING",
  ERROR: "ERROR",
};

export const useAuraRadio = () => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState("");
  const [started, setStarted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  const sessionIdRef = useRef(uuidv4());
  const audioRef = useRef(null);
  const contextRef = useRef([]);
  const queueRef = useRef([]);
  const loadingRef = useRef(false);
  const waitersRef = useRef([]);
  const isCleanedUp = useRef(false);

  const { mutateAsync: getTrack } = useGetTrack();

  const cleanup = useCallback(() => {
    if (isCleanedUp.current) return;
    isCleanedUp.current = true;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.onended = null;
      audioRef.current = null;
    }

    // Revoke blob URLs to free memory
    queueRef.current.forEach((item) => {
      if (item.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    });

    queueRef.current = [];
    setCurrentTrack(null);
    waitersRef.current = [];
    contextRef.current = [];
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const fetchNext = useCallback(async () => {
    try {
      const data = await getTrack({
        session_id: sessionIdRef.current,
        user_id: "user_123",
        context: contextRef.current,
      });

      if (data.context) {
        contextRef.current = data.context;
      }

      return data;
    } catch (err) {
      console.error("Failed to fetch track:", err);
      throw err;
    }
  }, [getTrack]);

  const addNextToQueue = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setStatus(STATUS.LOADING);
      const data = await fetchNext();

      // Add RJ intro audio
      const introUrl = base64ToUrl(data.audio_base64);
      queueRef.current.push({
        url: introUrl,
        type: "intro",
        metadata: null,
      });

      // Add song with metadata
      queueRef.current.push({
        url: data.song_download_url,
        type: "song",
        metadata: data.song_metadata,
      });

      // Wake waiting playback promises
      waitersRef.current.forEach((resolve) => resolve());
      waitersRef.current = [];

      if (status !== STATUS.PLAYING) {
        setStatus(STATUS.PLAYING);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setStatus(STATUS.ERROR);
      setErrorMessage(err.message || "Failed to load track");
      // Retry after delay
      setTimeout(() => {
        if (!isCleanedUp.current) {
          addNextToQueue();
        }
      }, 3000);
    } finally {
      loadingRef.current = false;
    }
  }, [fetchNext, status]);

  const playNext = useCallback(async () => {
    if (isCleanedUp.current) return;

    // Wait if buffer is empty
    if (queueRef.current.length === 0) {
      setStatus(STATUS.BUFFERING);
      await new Promise((resolve) => waitersRef.current.push(resolve));
    }

    const nextTrack = queueRef.current.shift();
    setCurrentTrack(nextTrack);

    try {
      if (audioRef.current) {
        audioRef.current.src = nextTrack.url;
        setStatus(STATUS.PLAYING);
        await audioRef.current.play();
      }
    } catch (err) {
      console.error("Playback error:", err);
      setStatus(STATUS.ERROR);
      setErrorMessage("Failed to play audio");
    }

    // Maintain buffer (2 tracks = 4 items: 2 intros + 2 songs)
    if (queueRef.current.length < 4 && !isCleanedUp.current) {
      addNextToQueue();
    }
  }, [addNextToQueue]);

  const start = useCallback(async () => {
    if (started) return;

    setStarted(true);
    setStatus(STATUS.STARTING);
    isCleanedUp.current = false;

    try {
      // Initialize audio element
      audioRef.current = new Audio();
      audioRef.current.onended = playNext;

      // Preload 2 tracks before starting
      await addNextToQueue();
      await playNext();
      await addNextToQueue();
    } catch (err) {
      console.error("Failed to start radio:", err);
      setStatus(STATUS.ERROR);
      setErrorMessage("Failed to start radio");
      setStarted(false);
    }
  }, [started, addNextToQueue, playNext]);

  const stop = useCallback(() => {
    cleanup();
    setStarted(false);
    setStatus(STATUS.IDLE);
  }, [cleanup]);

  return {
    status,
    errorMessage,
    started,
    currentTrack,
    start,
    stop,
  };
};
