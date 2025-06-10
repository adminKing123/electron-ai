import React from "react";
import useMessageStore from "../../store/useMessagesStore";
import Answer from "./Answer";
import MessageActions from "./MessageActions";
import MessagePromptActions from "./MessagePromptActions";

const Message = React.memo(({ message_id, chat }) => {
  const message = useMessageStore((state) => state.data[message_id]);

  const handleAnswerCopy = (callback) => {
    if (message?.answer) {
      navigator.clipboard.writeText(message.answer);
      callback?.(message?.id);
    }
  };

  const handleMessagePromptCopy = (callback) => {
    if (message?.prompt) {
      navigator.clipboard.writeText(message?.prompt);
      callback?.(message?.id);
    }
  };

  return (
    <div id={message.id} className="last:min-h-full max-w-[788px] px-5 mx-auto pb-24 last:pb-10">
      <div className="group">
        <div className="flex justify-end">
          <div className="max-w-full font-sans text-[15px] text-black dark:text-white px-5 py-[10px] bg-[#F4F4F4] dark:bg-[#303030] rounded-3xl w-fit break-words whitespace-pre-wrap">
            {message.prompt}
          </div>
        </div>
        <MessagePromptActions handleCopy={handleMessagePromptCopy} />
      </div>
      <div className="group">
        <Answer message={message} />
        <MessageActions
          id={message.id}
          message={message}
          handleCopy={handleAnswerCopy}
          chat={chat}
        />
      </div>
    </div>
  );
});

export default Message;
