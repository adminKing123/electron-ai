import { useRef } from "react";
import PromptActions from "./PromptActions";
import TextArea from "./TextArea";
import { useNavigate } from "react-router-dom";
import ChatGreetings from "./ChatGreetings";
import ScrollToBottomButton from "./PromptActions/ScrollToBottomButton";
import MessageRelatedActionsInPrompt from "./MessageRelatedActionsInPrompt";
import PromptDraftMaintainer from "./PromptActions/PromptDraftMaintainer";
import { handleSend as handleSendUtil } from "../utils/handleSend";

const Prompt = ({ chat }) => {
  const navigate = useNavigate();

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    handleSendUtil(chat, navigate);
  };

  return (
    <div className="w-full relative" id="prompt-box">
      <ScrollToBottomButton />
      <PromptDraftMaintainer chat={chat} />
      {chat.is_new ? <ChatGreetings /> : null}
      <div
        id="inner-prompt-box"
        className="bg-white dark:bg-ink-825 rounded-[22px]
          border border-ink-150 dark:border-ink-750
          shadow-glow-lg dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]"
      >
        <MessageRelatedActionsInPrompt fileInputRef={fileInputRef} />
        <div className="px-5 py-[15px]">
          <TextArea
            textareaRef={textareaRef}
            handleSend={handleSend}
            shouldAutoFocus={chat.shouldAutoFocus ? true : false}
          />
          <PromptActions
            handleSend={handleSend}
            fileInputRef={fileInputRef}
            chat={chat}
          />
        </div>
      </div>
    </div>
  );
};

export default Prompt;
