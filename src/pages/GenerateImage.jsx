import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { IoArrowUp, IoCopy, IoStop } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { MdDone } from "react-icons/md";
import { motion } from "framer-motion";

const useMessageStore = create((set) => ({
  messages: [],
  addMessage: (message) => {
    const id = uuidv4();
    set((state) => ({
      messages: [...state.messages, { id, ...message }],
    }));
    return id;
  },
  deleteMessage: (message_id) => {
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== message_id),
    }));
  },
  addChunkInMessageAnswer: (id, chunk) => {
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id === id && chunk) {
          const answer = (msg.answer || "") + chunk;
          return { ...msg, answer };
        }
        return msg;
      }),
    }));
  },

  process: null,
  controller: null,
  setProcess: (process = null, controller = null) => {
    set((state) => {
      console.log(controller);
      state.controller?.abort();
      return { process, controller };
    });
  },
}));

const handleStream = async (
  id,
  prompt,
  onProgress,
  onStart,
  onEnd,
  onError
) => {
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
          prompt: prompt,
          chat_uid: "f7bce2c1-37bd-4f79-8fca-86fc9a851b6e",
          file_url: [],
          org_id: "synapses",
          uid: "un2xqHu71cd6WWycTr1P6UE4PiJ2",
          regenerate: false,
          style: "Standard",
          model_id: "gemini-2.0-flash-001",
          recaching: false,
          google_search: false,
          cache_id: null,
          file_data: "",
          prompt_id: id,
          new_prompt: "",
          by: "un2xqHu71cd6WWycTr1P6UE4PiJ2",
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

const scrollToMessage = (id, duration = 100) => {
  setTimeout(() => {
    const messageEle = document.getElementById(id);
    const container = document.getElementById("messages-container");
    if (messageEle && container) {
      const topPos = messageEle.offsetTop;
      container.scrollTo({
        top: topPos,
        behavior: "smooth",
      });
    }
  }, duration);
};

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
      className="last:min-h-full max-w-[768px] mx-auto group"
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
        <div className="max-w-[768px] mx-auto w-full">
          <Prompt />
        </div>
      </div>
    </div>
  );
}

export default GenerateImage;
