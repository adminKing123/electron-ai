import CONFIG from "../../config";
import { useProcessController } from "../../store/useMessagesStore";
import { useImageGenerateStore } from "../../store/usePromptStores";
import useUserStore from "../../store/useUserStore";

const handleStream = async (id, data, onProgress, onStart, onEnd, onError) => {
  const user = useUserStore.getState().DEFAULT_USER;
  const setProcess = useProcessController.getState().setProcess;
  const isImageGenerateOn = useImageGenerateStore.getState().isImageGenerateOn;
  try {
    const controller = new AbortController();
    setProcess({
      type: "GENERATION",
      process_name: "GETTING_STARTED",
      id: id,
    });
    onStart?.({ id });
    const response = await fetch(
      CONFIG.GET_GENERATE_URL({
        generate_image: isImageGenerateOn,
      }),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "global",
          prompt: data.prompt,
          chat_uid: data.chat_id,
          file_url: [],
          org_id: user.org_id ? user.org_id : "",
          uid: user.uid ? user.uid : "",
          regenerate: data?.regenerate ? true : false,
          style: data?.response_style ? data.response_style : "Standard",
          model_id: data?.model_id ? data.model_id : null,
          recaching: false,
          google_search: data?.google_search ? true : false,
          cache_id: null,
          file_data: "",
          prompt_id: id,
          new_prompt: "",
          by: user.uid ? user.uid : "",
        }),
        signal: controller.signal,
      }
    );

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
