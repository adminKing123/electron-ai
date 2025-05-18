import { useEffect, useRef, useState } from "react";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { IoArrowUp, IoCopy, IoStop } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { MdDone } from "react-icons/md";
import useMessageStore from "../store/useMessagesStore";
import handleStream from "../apis/prompt_generation/handleStream";
import { scrollToMessage } from "../utils/helpers";

const CopyButton = ({ handleCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleClickCopy = () => {
    if (copied) return;
    handleCopy?.(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 800);
    });
  };

  return (
    <button
      onClick={handleClickCopy}
      className="p-[6px] hover:bg-[#1d1d1d] rounded-md"
    >
      {copied ? <MdDone /> : <IoCopy />}
    </button>
  );
};

const DeleteMessageButton = ({ id }) => {
  const { deleteMessage } = useMessageStore();
  const handleClickDelete = () => {
    deleteMessage(id);
  };

  return (
    <button
      onClick={handleClickDelete}
      className="p-[6px] hover:bg-[#1d1d1d] rounded-md"
    >
      <MdDelete />
    </button>
  );
};

const MessageActions = ({ id, handleCopy }) => {
  const { process } = useMessageStore();

  if (process?.id === id) return null;

  return (
    <div className="mt-2 mb-[30px] text-white overflow-hidden opacity-0 group-hover:opacity-100">
      <CopyButton handleCopy={handleCopy} />
      <DeleteMessageButton id={id} />
    </div>
  );
};

const Message = ({ message }) => {
  const handleCopy = (callback) => {
    if (message?.answer) {
      navigator.clipboard.writeText(message.answer);
      callback?.(message?.id);
    }
  };

  return (
    <div
      id={message.id}
      className="last:min-h-full max-w-[768px] px-5 md:px-0 md:mx-auto group"
    >
      <div className="flex justify-end">
        <pre className="font-sans text-[15px] text-white px-5 py-[15px] bg-[#060606] rounded-3xl w-fit border-[2px] border-[#1c1e21] break-words whitespace-pre-wrap">
          {message.prompt}
        </pre>
      </div>
      {message?.answer ? (
        <div className="text-white mt-2">
          <MarkdownRenderer content={message.answer} />
        </div>
      ) : null}
      <MessageActions id={message.id} handleCopy={handleCopy} />
    </div>
  );
};

const Messages = () => {
  const { messages } = useMessageStore();
  return (
    <div
      className={`overflow-y-auto transition-all duration-500 ${
        messages.length ? "flex-grow min-h-[40%]" : "h-[40%]"
      }`}
      id="messages-container"
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};

const SendButton = ({
  onClick,
  stopGeneration,
  disabled,
  isGeneratingPrompt,
}) => {
  if (isGeneratingPrompt)
    return (
      <button
        onClick={stopGeneration}
        className="bg-[#ffffff] hover:bg-[#C1C1C1] disabled:opacity-50 p-2 rounded-full"
      >
        <IoStop />
      </button>
    );
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-[#ffffff] hover:bg-[#C1C1C1] disabled:opacity-50 p-2 rounded-full"
    >
      <IoArrowUp />
    </button>
  );
};

const PromptActions = ({
  handleSend,
  isSendButtonDisabled,
  isGeneratingPrompt,
  stopGeneration,
}) => {
  return (
    <div className="flex justify-end">
      <SendButton
        onClick={handleSend}
        stopGeneration={stopGeneration}
        disabled={isSendButtonDisabled}
        isGeneratingPrompt={isGeneratingPrompt}
      />
    </div>
  );
};

const Prompt = () => {
  const { process, setProcess, addMessage, addChunkInMessageAnswer } =
    useMessageStore();
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef(null);
  const isPromptSendDisabled = process || !prompt.trim() ? true : false;
  const isSendButtonDisabled = !prompt.trim() ? true : false;
  const isGeneratingPrompt = process ? true : false;

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
    });
    handleStream(id, prompt, onProgress, onStart, onEnd, onError);
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
        />
      </div>
    </div>
  );
};

function GenerateImage() {
  return (
    <div className="bg-[#0d1117] w-screen h-[100dvh] py-2">
      <div className="flex flex-col h-full w-full">
        <Messages />
        <div className="max-w-[768px] px-5 md:px-0 md:mx-auto w-full">
          <Prompt />
        </div>
      </div>
    </div>
  );
}

export default GenerateImage;
