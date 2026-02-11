import { useState, useRef, useEffect } from "react";
import { GoogleGenAI, Modality } from "@google/genai";
import { getLiveSessionIdAPI } from "../apis/live_ai/queryFunctions";

const base64ToBytes = (b64) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export default function LiveChatWithAIPage() {
  const [status, setStatus] = useState("idle");
  const sessionRef = useRef(null);
  const audioCtxRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);

  const playbackCtxRef = useRef(null);
  const playerNodeRef = useRef(null);

  const cleanup = () => {
    try {
      if (sessionRef.current) {
        sessionRef.current.sendRealtimeInput({ audioStreamEnd: true });
        sessionRef.current.close();
        sessionRef.current = null;
      }

      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }

      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (playerNodeRef.current) {
        playerNodeRef.current.port.postMessage({ type: "clear" });
        playerNodeRef.current.disconnect();
        playerNodeRef.current = null;
      }

      if (playbackCtxRef.current) {
        playbackCtxRef.current.close();
        playbackCtxRef.current = null;
      }
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  async function start() {
    try {
      setStatus("Fetching token...");

      const data = await getLiveSessionIdAPI();
      const token = data.name;

      const ai = new GoogleGenAI({
        apiKey: token,
        httpOptions: { apiVersion: "v1alpha" },
      });

      setStatus("Connecting...");

      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
        },

        callbacks: {
          onopen: () => setStatus("🎤 Connected — speak now"),
          onclose: () => setStatus("Connection closed"),
          onerror: (e) => console.error("WS Error:", e),

          onmessage: (msg) => {
            if (msg?.serverContent?.interrupted) {
              playerNodeRef.current?.port.postMessage({ type: "clear" });
              return;
            }

            const parts = msg?.serverContent?.modelTurn?.parts || [];

            for (const part of parts) {
              if (!part.inlineData?.data) continue;

              const bytes = base64ToBytes(part.inlineData.data);

              const pcm16 = new Int16Array(
                bytes.buffer,
                bytes.byteOffset,
                bytes.byteLength / 2,
              );

              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32768;
              }

              playerNodeRef.current?.port.postMessage({
                type: "push",
                audio: float32,
              });
            }
          },
        },
      });

      sessionRef.current = session;

      const playbackCtx = new AudioContext({ sampleRate: 24000 });
      playbackCtxRef.current = playbackCtx;

      await playbackCtx.audioWorklet.addModule("/pcm-player-worklet.js");

      const playerNode = new AudioWorkletNode(playbackCtx, "pcm-player");
      playerNode.connect(playbackCtx.destination);
      playerNodeRef.current = playerNode;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(1024, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        if (!sessionRef.current) return;

        const input = event.inputBuffer.getChannelData(0);

        const pcm16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
        }

        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(pcm16.buffer)),
        );

        sessionRef.current.sendRealtimeInput({
          audio: {
            data: base64,
            mimeType: "audio/pcm;rate=16000",
          },
        });
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  function stop() {
    cleanup();
    setStatus("stopped");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Gemini Live Voice</h1>
      <button onClick={start}>Start Talking</button>
      <button onClick={stop}>Stop</button>
      <p>Status: {status}</p>
    </div>
  );
}
