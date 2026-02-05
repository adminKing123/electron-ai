import React, { useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useGetTrack } from "../apis/aura_rj/queryHooks";

// ============ UTILITY FUNCTIONS ============

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

// ============ MAIN COMPONENT ============

export default function AuraRadioPlayer() {
  // ============ REFS ============
  const sessionIdRef = useRef(uuidv4());
  const audioRef = useRef(new Audio());
  const contextRef = useRef([]);
  const queueRef = useRef([]);
  const loadingRef = useRef(false);
  const waitersRef = useRef([]);

  // ============ STATE ============
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("idle");

  // ============ API HOOKS ============
  const { mutateAsync: getTrack } = useGetTrack();

  // ============ API FUNCTIONS ============

  const fetchNext = useCallback(async () => {
    const data = await getTrack({
      session_id: sessionIdRef.current,
      user_id: "user_123",
      context: contextRef.current,
    });

    if (data.context) {
      contextRef.current = data.context;
    }

    return data;
  }, [getTrack]);

  // ============ BUFFER MANAGEMENT ============

  const addNextToQueue = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setStatus("loading next track...");
      const data = await fetchNext();

      // Add RJ intro audio
      queueRef.current.push(base64ToUrl(data.audio_base64));

      // Add song URL
      queueRef.current.push(data.song_download_url);

      // Wake waiting playback promises
      waitersRef.current.forEach((resolve) => resolve());
      waitersRef.current = [];

      setStatus("ready");
    } catch (err) {
      console.error("Fetch failed, retrying...", err);
      setTimeout(addNextToQueue, 2000);
    } finally {
      loadingRef.current = false;
    }
  }, [fetchNext]);

  // ============ PLAYBACK CONTROL ============

  const playNext = useCallback(async () => {
    // Wait if buffer is empty
    if (queueRef.current.length === 0) {
      setStatus("buffering...");
      await new Promise((resolve) => waitersRef.current.push(resolve));
    }

    const nextSrc = queueRef.current.shift();

    try {
      audioRef.current.src = nextSrc;
      setStatus("playing");
      await audioRef.current.play();
    } catch (err) {
      console.error("Playback error:", err);
    }

    // Maintain buffer (2 tracks = 4 items: 2 intros + 2 songs)
    if (queueRef.current.length < 4) {
      addNextToQueue();
    }
  }, [addNextToQueue]);

  // ============ RADIO START ============

  const startRadio = useCallback(async () => {
    if (started) return;
    setStarted(true);

    setStatus("starting...");

    // Preload 2 tracks before starting
    await addNextToQueue();
    await playNext();
    await addNextToQueue();


    // Setup auto-play next track when current ends
    audioRef.current.onended = playNext;
  }, [started, addNextToQueue, playNext]);

  // ============ UI ============

  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <h2>AURA RJ Radio</h2>

      <button
        onClick={startRadio}
        disabled={started}
        style={{
          padding: "12px 22px",
          fontSize: 18,
          cursor: started ? "not-allowed" : "pointer",
          opacity: started ? 0.6 : 1,
        }}
      >
        {started ? "Radio Started" : "Start Radio"}
      </button>

      <div style={{ marginTop: 20 }}>
        <b>Status:</b> {status}
      </div>
    </div>
  );
}
