import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { IoCopy } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { motion } from "framer-motion";

const useMessageStore = create((set) => ({
  messages: [
    {
      id: "1",
      prompt: "What is that?",
      answer: "This is nothing.",
    },
  ],
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
  setProcess: (process) => set({ process }),
}));

const handleStream = async (
  id,
  prompt,
  onProgress,
  onStart,
  onEnd,
  onError
) => {
  try {
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
      }
    );

    if (!response.ok || !response.body) {
      throw new Error("Stream error");
    }

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
    onEnd?.();
  } catch (err) {
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

const MessageActions = ({ id }) => {
  const { process, deleteMessage } = useMessageStore();

  const handleClickDelete = () => {
    deleteMessage(id);
  };

  if (process?.id === id) return null;

  return (
    <div className="mt-2 mb-[30px] text-white overflow-hidden opacity-0 group-hover:opacity-100">
      <button className="p-[6px] hover:bg-[#1d1d1d] rounded-md">
        <IoCopy />
      </button>
      <button
        onClick={handleClickDelete}
        className="p-[6px] hover:bg-[#1d1d1d] rounded-md"
      >
        <MdDelete />
      </button>
    </div>
  );
};

const Message = ({ message }) => {
  return (
    <div
      id={message.id}
      className="last:min-h-full max-w-[768px] mx-auto group"
    >
      <div className="flex justify-end">
        <pre className="font-sans text-[15px] text-white px-5 py-[15px] bg-[#060606] rounded-3xl w-fit border-[2px] border-[#1c1e21]">
          {message.prompt}
        </pre>
      </div>
      {message?.answer ? (
        <div className="text-white mt-2">
          <MarkdownRenderer content={message.answer} />
        </div>
      ) : null}
      <MessageActions id={message.id} />
    </div>
  );
};

const Messages = () => {
  const { messages } = useMessageStore();
  return (
    <div
      className={`overflow-y-auto transition-all duration-500 ${
        messages.length ? "flex-grow min-h-[35%]" : "h-[35%]"
      }`}
      id="messages-container"
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};

const Indicator = () => {
  const { process } = useMessageStore();
  if (process)
    return (
      <div className="text-[#ffffff] text-xs text-right italic mt-2 absolute -top-7 right-0">
        {process?.process_name}
      </div>
    );
  return null;
};

const Prompt = () => {
  const { process, setProcess, addMessage, addChunkInMessageAnswer } =
    useMessageStore();
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef(null);
  const isDisabled = process ? true : false;

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
    setProcess({
      type: "GENERATION",
      process_name: "Generating...",
      id: data.id,
    });
    addChunkInMessageAnswer(data.id, data.chunk);
  };

  const onStart = (data) => {
    setProcess({
      type: "GENERATION",
      process_name: "Getting Started...",
      id: data.id,
    });
    scrollToMessage(data.id);
  };

  const onEnd = () => {
    setProcess(null);
  };

  const onError = () => {
    setProcess(null);
  };

  const handleSend = () => {
    if (!prompt.trim() || isDisabled) return;

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
      <Indicator />
      <div className="px-5 py-[15px] bg-[#0f0f0f] rounded-3xl border-[2px] border-[#1c1e21]">
        <textarea
          ref={textareaRef}
          className="w-full bg-[#0f0f0f] resize-none outline-none text-white text-[15px] min-h-[102px] max-h-[240px] overflow-y-auto"
          autoFocus
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
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
