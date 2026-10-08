const SAMPLE_RATE = 16000;

function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;

  for (let i = 0; i < float32Array.length; i++) {
    let sample = Math.max(-1, Math.min(1, float32Array[i]));
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, sample, true);
    offset += 2;
  }

  return buffer;
}

/**
 * Live Deepgram STT over WebSocket (linear16 PCM @ 16kHz).
 * Token and listen URL come from the backend live-config endpoint.
 */
export function createDeepgramLiveSession({
  listenUrl,
  token,
  params,
  onTranscript,
  onError,
}) {
  let socket = null;
  let mediaStream = null;
  let audioContext = null;
  let processor = null;
  let source = null;
  let isRecording = false;
  let finalTranscript = "";
  let sessionActive = false;

  const updateTranscript = (interim = "") => {
    if (!sessionActive) return;
    const combined = (finalTranscript + interim).trim();
    onTranscript?.(combined, { final: finalTranscript.trim(), interim: interim.trim() });
  };

  const handleDeepgramMessage = (data) => {
    if (!sessionActive) return;
    try {
      const response = JSON.parse(data);
      if (response.type !== "Results") return;

      const alternative = response.channel?.alternatives?.[0];
      if (!alternative) return;

      const transcript = alternative.transcript || "";
      if (!transcript.trim()) return;

      if (response.is_final) {
        finalTranscript += `${transcript.trim()} `;
        updateTranscript("");
      } else {
        updateTranscript(transcript);
      }
    } catch (err) {
      console.error("[STT] Invalid Deepgram response:", err);
    }
  };

  const startAudioProcessing = () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: SAMPLE_RATE,
    });

    source = audioContext.createMediaStreamSource(mediaStream);
    processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;

      const inputData = event.inputBuffer.getChannelData(0);
      socket.send(floatTo16BitPCM(inputData));
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
    isRecording = true;
  };

  const cleanup = ({ closeSocket = true } = {}) => {
    sessionActive = false;
    isRecording = false;

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }

    if (processor) {
      processor.disconnect();
      processor = null;
    }

    if (source) {
      source.disconnect();
      source = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    if (socket) {
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (closeSocket) {
        if (socket.readyState === WebSocket.OPEN) {
          try {
            socket.send(JSON.stringify({ type: "CloseStream" }));
          } catch (err) {
            console.warn("[STT] CloseStream failed:", err);
          }
        }
        socket.close();
      }
      socket = null;
    }
  };

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone access is not supported in this environment.");
    }

    sessionActive = true;
    finalTranscript = "";
    updateTranscript("");

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: SAMPLE_RATE,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const query = new URLSearchParams(params);
    socket = new WebSocket(`${listenUrl}?${query.toString()}`, ["token", token]);
    socket.binaryType = "arraybuffer";

    await new Promise((resolve, reject) => {
      socket.onopen = () => {
        startAudioProcessing();
        resolve();
      };

      socket.onerror = (event) => {
        console.error("[STT] Deepgram WebSocket error:", event);
        reject(new Error("Deepgram connection failed. Check your API key and network."));
      };

      socket.onmessage = (event) => handleDeepgramMessage(event.data);

      socket.onclose = () => {
        if (isRecording) {
          cleanup({ closeSocket: false });
          onError?.(new Error("Deepgram connection closed unexpectedly."));
        }
      };
    });
  };

  const stop = () => {
    sessionActive = false;
    const text = finalTranscript.trim();
    finalTranscript = "";
    cleanup({ closeSocket: true });
    return text;
  };

  const resetTranscript = () => {
    finalTranscript = "";
    if (sessionActive) {
      updateTranscript("");
    }
  };

  return {
    start,
    stop,
    resetTranscript,
    getFinalTranscript: () => finalTranscript.trim(),
  };
}

export function isDeepgramSttSupported() {
  return Boolean(
    typeof WebSocket !== "undefined" &&
      navigator.mediaDevices?.getUserMedia,
  );
}
