import { useProcessController } from "../../store/useMessagesStore";
import useUserStore from "../../store/useUserStore";
import ENDPOINTS from "../endpoints";
import { stopGeneration } from "./generationControl";

const chunkParser = (id, eventType, dataString, onProgress) => {
  if (eventType === "error" || eventType === "end") return;
  const parsedData = JSON.parse(dataString);
  onProgress?.({
    id,
    event: {
      type: eventType,
      data: parsedData,
    },
  });
};

const handleStream = async (id, data, onProgress, onStart, onEnd, onError) => {
  const setProcess = useProcessController.getState().setProcess;
  const user = useUserStore.getState().user;
  const token = user?.getIdToken ? await user.getIdToken() : null;

  try {
    const controller = new AbortController();

    setProcess(
      {
        type: "GENERATION",
        process_name: "GETTING_STARTED",
        id: id,
        messageId: id,
      },
      controller
    );
    onStart?.({ id });

    const response = await fetch(ENDPOINTS.GET_GENERATE_URL(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      setProcess(null);
      throw new Error("Stream error");
    }

    const taskId = response.headers.get("X-Task-ID");

    setProcess(
      {
        type: "GENERATION",
        process_name: "GENERATING",
        id: id,
        messageId: id,
        taskId: taskId,
      },
      controller
    );

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (let done = false; !done; ) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        buffer += decoder.decode(value, { stream: true });
        let sseChunks = buffer.split("\n\n");
        buffer = sseChunks.pop();

        for (const chunk of sseChunks) {
          const lines = chunk.trim().split("\n");
          let eventType = "message";
          let dataString = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              dataString += line.replace("data:", "").trim();
            }
          }

          if (eventType === "end") {
            setProcess(null);
            onEnd?.({ id });
            return;
          }

          if (eventType === "stopped") {
            setProcess(null);
            onEnd?.({ id, stopped: true });
            return;
          }

          try {
            chunkParser(id, eventType, dataString, onProgress);
          } catch (e) {
            console.error("Failed to parse SSE data:", dataString, e);
          }
        }
      }
    }

    setProcess(null);
    onEnd?.({ id });
  } catch (err) {
    if (err.name === "AbortError") {
      setProcess(null);
      onEnd?.({ id, stopped: true });
      return;
    }
    
    setProcess(null);
    onError?.({ id, error: err.message });
  }
};

export const stopCurrentGeneration = async (messageId) => {
  const result = await stopGeneration(messageId);
  return result.success;
};

export default handleStream;
