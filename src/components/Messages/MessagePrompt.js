import CONFIG from "../../config";
import useMessageStore from "../../store/useMessagesStore";
import usePromptStore from "../../store/usePromptStores";
import MessagePromptActions from "./MessagePromptActions";
import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { focusPromptTextArea } from "../../utils/helpers";
import MessageAttachedFiles from "./MessageAttachedFiles";

const COLLAPSED_HEIGHT = 160;

const PromptBox = ({ prompt }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      setShouldShowButton(contentRef.current.scrollHeight > COLLAPSED_HEIGHT);
    }
  }, [prompt]);

  return (
    <div className="flex flex-col items-end gap-1">
      {/* Bubble */}
      <div
        ref={contentRef}
        className={`relative max-w-[80%] sm:max-w-[68%] font-sans text-[14px] leading-[1.55]
          text-ink-975 dark:text-ink-50
          px-4 py-2.5
          bg-brand-50 dark:bg-brand-950
          border border-brand-100 dark:border-brand-900
          rounded-2xl rounded-tr-[4px]
          w-fit break-words whitespace-pre-wrap
          ${collapsed && shouldShowButton ? "max-h-[160px] overflow-hidden" : ""}
        `}
      >
        {prompt}
        {collapsed && shouldShowButton && (
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-brand-50 dark:from-brand-950 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand / collapse toggle */}
      {shouldShowButton && (
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex items-center gap-1 text-[11px] font-medium
            text-ink-400 dark:text-ink-550
            hover:text-ink-650 dark:hover:text-ink-500
            transition-colors"
        >
          <FaAngleDown
            className={`w-[10px] h-[10px] transition-transform duration-200 ${
              collapsed ? "" : "rotate-180"
            }`}
          />
          <span>{collapsed ? "Show more" : "Show less"}</span>
        </button>
      )}
    </div>
  );
};

const MessagePrompt = ({ message_id }) => {
  const prompt = useMessageStore((state) => state.data[message_id]?.prompt);
  const setAction = usePromptStore((state) => state.setAction);
  const setPrompt = usePromptStore((state) => state.setPrompt);

  const handleMessagePromptCopy = (callback) => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      callback?.(message_id);
    }
  };

  const handlePromptEdit = () => {
    setPrompt(prompt);
    setAction({
      type: CONFIG.PROMPT_ACTION_TYPES.EDIT,
      data: {
        message_id,
        prompt,
      },
    });
    focusPromptTextArea("last");
  };

  return (
    <div className="group">
      <PromptBox prompt={prompt} />
      <MessageAttachedFiles message_id={message_id} />
      <MessagePromptActions
        handleCopy={handleMessagePromptCopy}
        handleEdit={handlePromptEdit}
      />
    </div>
  );
};

export default MessagePrompt;
