import useMessageStore from "../../store/useMessagesStore";

const handleStream = async (id, data, onProgress, onStart, onEnd, onError) => {
  const setProcess = useMessageStore.getState().setProcess;
  try {
    const controller = new AbortController();
    setProcess({
      type: "GENERATION",
      process_name: "Getting Started...",
      id: id,
    });
    onStart?.({ id });
    const response = await fetch(
      "https://pa-dev-api.thesynapses.com/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "global",
          prompt: data.prompt,
          chat_uid: "f7bce2c1-37bd-4f79-8fca-86fc9a851b6e",
          file_url: [],
          org_id: "synapses",
          uid: data?.uid ? data.uid : "un2xqHu71cd6WWycTr1P6UE4PiJ2",
          regenerate: data?.regenerate ? true : false,
          style: data?.response_style ? data.response_style : "Standard",
          model_id: data?.model_id ? data.model_id : null,
          recaching: false,
          google_search: data?.google_search ? true : false,
          cache_id: null,
          file_data: "",
          prompt_id: id,
          new_prompt: "",
          by: data?.by ? data.by : "un2xqHu71cd6WWycTr1P6UE4PiJ2",
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
        process_name: "Generating...",
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
    onEnd?.();
  } catch (err) {
    setProcess(null);
    onError?.();
  }
};

export default handleStream;
