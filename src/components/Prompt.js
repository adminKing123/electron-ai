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
        className="bg-white dark:bg-[#252525] rounded-3xl
          border border-[#e4e4e4] dark:border-[#2e2e2e]
          shadow-[0_2px_16px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]"
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
