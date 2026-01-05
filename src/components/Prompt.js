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
        className="bg-[#FFFFFF] dark:bg-[#303030] rounded-3xl border-[2px] border-[#E2E2E2] dark:border-[#1c1e21]"
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
