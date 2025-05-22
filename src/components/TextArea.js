import { useEffect } from "react";
import usePromptStore from "../store/usePromptStores";

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

export default TextArea;
