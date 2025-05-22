import { useEffect, useRef, useState } from "react";
import useMessageStore from "../store/useMessagesStore";
import { scrollToMessage } from "../utils/helpers";
import PromptActions from "./PromptActions";
import handleStream from "../apis/prompt_generation/handleStream";
import usePromptStore from "../store/usePromptStore";

const TextArea = ({ textareaRef, handleSend }) => {
  const { prompt, setPrompt } = usePromptStore();

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [prompt]);

  return (
    <textarea
      ref={textareaRef}
      className="w-full bg-[#0f0f0f] resize-none outline-none text-white text-[15px] min-h-[30px] max-h-[240px] overflow-y-auto"
      autoFocus
      placeholder="Ask anything"
      value={prompt}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      rows={1}
    />
  );
};

const Prompt = ({ chat_id }) => {
  const { addMessage, addChunkInMessageAnswer } = useMessageStore();
  const textareaRef = useRef(null);

  const onProgress = (data) => {
    addChunkInMessageAnswer(data.id, data.chunk);
  };

  const onStart = (data) => {
    scrollToMessage(data.id);
  };

  const onEnd = () => {};

  const onError = () => {};

  const handleSend = () => {
    const { prompt, model, setPrompt } = usePromptStore.getState();
    const { process } = useMessageStore.getState();
    const isPromptSendDisabled =
      process || !prompt.trim() || model === null ? true : false;

    if (isPromptSendDisabled) return;

    const { isWebSearchDisabled, isWebSearchOn } = usePromptStore.getState();
    const google_search = isWebSearchDisabled ? false : isWebSearchOn;

    const id = addMessage({
      prompt,
      answer: "",
      model: model,
      google_search,
    });
    handleStream(
      id,
      {
        chat_id,
        prompt,
        google_search,
        model_id: model?.id,
      },
      onProgress,
      onStart,
      onEnd,
      onError
    );
    setPrompt("");
  };

  return (
    <div className="w-full relative">
      <div className="px-5 py-[15px] bg-[#0f0f0f] rounded-3xl border-[2px] border-[#1c1e21]">
        <TextArea textareaRef={textareaRef} handleSend={handleSend} />
        <PromptActions handleSend={handleSend} />
      </div>
    </div>
  );
};

export default Prompt;
