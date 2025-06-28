import { useProcessController } from "../../store/useMessagesStore";
import ENDPOINTS from "../endpoints";

const handleStream = async (id, data, onProgress, onStart, onEnd, onError) => {
  const setProcess = useProcessController.getState().setProcess;
  try {
    const controller = new AbortController();
    setProcess(
      {
        type: "GENERATION",
        process_name: "GETTING_STARTED",
        id: id,
      },
      controller
    );
    onStart?.({ id });
    const response = await fetch(ENDPOINTS.GET_GENERATE_URL(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: data.prompt,
        model_id: data?.model_id ? data.model_id : null,
        google_search: data?.google_search ? true : false,
      }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      setProcess(null);
      throw new Error("Stream error");
    }

    setProcess(
      {
        type: "GENERATION",
        process_name: "GENERATING",
        id: id,
      },
      controller
    );

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    for (let done = false; !done; ) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        onProgress?.({ id, chunk });
      }
    }

    setProcess(null);
    onEnd?.({ id });
  } catch (err) {
    setProcess(null);
    onError?.({ id });
  }
};

export default handleStream;
