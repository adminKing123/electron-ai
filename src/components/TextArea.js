import { useEffect } from "react";
import usePromptStore from "../store/usePromptStores";

const TextArea = ({ textareaRef, handleSend, shouldAutoFocus }) => {
  const prompt = usePromptStore((state) => state.prompt);
  const setPrompt = usePromptStore((state) => state.setPrompt);

  const handleChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (window.innerWidth > 768 && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const autoResize = () => {
      const textarea = textareaRef.current;
      const messagesContainer = document.getElementById("messages-container");
      const promptContainer = document.getElementById("prompt-container");

      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
      }

      if (messagesContainer && promptContainer) {
        const promptHeight = promptContainer.offsetHeight;
        messagesContainer.style.paddingBottom = `${promptHeight - 80}px`;
      }
    };
    autoResize();
  }, [prompt, textareaRef]);

  return (
    <textarea
      ref={textareaRef}
      className="w-full bg-[#FFFFFF] dark:bg-[#303030] resize-none outline-none text-black dark:text-white text-[15px] min-h-[30px] max-h-[240px] overflow-y-auto"
      autoFocus={shouldAutoFocus}
      placeholder="Ask anything"
      value={prompt}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      rows={1}
    />
  );
};

export default TextArea;
