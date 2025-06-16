import useMessageStore from "../../store/useMessagesStore";
import MessagePromptActions from "./MessagePromptActions";
import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";

const COLLAPSED_HEIGHT = 160;

const PromptBox = ({ prompt }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setShouldShowButton(height > COLLAPSED_HEIGHT);
    }
  }, [prompt]);

  const handleClick = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className="flex justify-end">
      <div
        ref={contentRef}
        className={`relative max-w-full font-sans text-[15px] text-black dark:text-white px-5 py-[10px] bg-[#F4F4F4] dark:bg-[#303030] rounded-3xl rounded-tr-lg w-fit break-words whitespace-pre-wrap ${
          collapsed && shouldShowButton ? "max-h-[160px] overflow-hidden" : ""
        }`}
      >
        {prompt}
        {shouldShowButton && (
          <button
            onClick={handleClick}
            className="w-8 h-8 px-2 transparent rounded-lg absolute top-[10px] right-[20px]"
          >
            <FaAngleDown
              className={`text-[#666666] dark:text-white w-[16px] h-[16px] ${
                collapsed ? "" : "rotate-180"
              } transition-transform duration-150`}
            />
          </button>
        )}
        {collapsed && shouldShowButton && (
          <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#F4F4F4] dark:from-[#303030] to-transparent pointer-events-none rounded-b-3xl" />
        )}
      </div>
    </div>
  );
};

const MessagePrompt = ({ message_id }) => {
  const prompt = useMessageStore((state) => state.data[message_id]?.prompt);
  const handleMessagePromptCopy = (callback) => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      callback?.(message_id);
    }
  };

  return (
    <div className="group">
      <PromptBox prompt={prompt} />
      <MessagePromptActions handleCopy={handleMessagePromptCopy} />
    </div>
  );
};

export default MessagePrompt;
