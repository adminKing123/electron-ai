import { useEffect, useRef, useState } from "react";
import useMessageStore from "../store/useMessagesStore";
import { scrollToMessage } from "../utils/helpers";
import PromptActions from "./PromptActions";
import handleStream from "../apis/prompt_generation/handleStream";

const Prompt = ({ chat_id }) => {
  const { process, setProcess, addMessage, addChunkInMessageAnswer } =
    useMessageStore();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(null);
  const [isWebSearchOn, setIsWebSearchOn] = useState(false);
  const textareaRef = useRef(null);
  const isPromptSendDisabled = process || !prompt.trim() || model === null ? true : false;
  const isSendButtonDisabled = !prompt.trim() || model === null ? true : false;
  const isGeneratingPrompt = process ? true : false;
  const [isWebSearchDisabled, setIsWebSearchDisabled] = useState(true);
  const google_search = isWebSearchDisabled ? false : isWebSearchOn;

  const toggleWebSearchDisabled = (value) => {
    setIsWebSearchDisabled(value);
  };

  const stopGeneration = () => {
    setProcess(null);
    textareaRef?.current?.focus();
  };

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
    }
  };

  const handleClickWebSearch = () => {
    setIsWebSearchOn((prev) => !prev);
  };

  const handleModelSelect = (model_selected) => {
    setModel(model_selected);
    toggleWebSearchDisabled(model_selected.google_search === false);
  };

  useEffect(() => {
    autoResize();
  }, [prompt]);

  const onProgress = (data) => {
    addChunkInMessageAnswer(data.id, data.chunk);
  };

  const onStart = (data) => {
    scrollToMessage(data.id);
  };

  const onEnd = () => {};

  const onError = () => {};

  const handleSend = () => {
    if (isPromptSendDisabled) return;

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      handleSend();
    }
  };

  return (
    <div className="w-full relative">
      <div className="px-5 py-[15px] bg-[#0f0f0f] rounded-3xl border-[2px] border-[#1c1e21]">
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
        <PromptActions
          isSendButtonDisabled={isSendButtonDisabled}
          isGeneratingPrompt={isGeneratingPrompt}
          stopGeneration={stopGeneration}
          handleSend={handleSend}
          handleClickWebSearch={handleClickWebSearch}
          isWebSearchOn={isWebSearchOn}
          handleModelSelect={handleModelSelect}
          selectedModel={model}
          isWebSearchDisabled={isWebSearchDisabled}
          toggleWebSearchDisabled={toggleWebSearchDisabled}
        />
      </div>
    </div>
  );
};

export default Prompt;
