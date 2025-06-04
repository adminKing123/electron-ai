import { useEffect } from "react";
import useMessageStore from "../../store/useMessagesStore";
import Message from "./Message";
import { scrollToBottom } from "../../utils/helpers";

const Messages = ({ chat }) => {
  const messages = useMessageStore((state) => state.messages);

  useEffect(() => {
    const promptEle = document.getElementById("prompt-container");
    if (messages.length) promptEle.classList.remove("screen-center");
    else promptEle.classList.add("screen-center");
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom(chat);
  }, [chat]);

  return (
    <div
      className={`overflow-y-auto py-2 transition-[height] duration-500 flex-grow`}
      id="messages-container"
    >
      {messages.map((message) => (
        <Message key={message} message_id={message} chat={chat} />
      ))}
    </div>
  );
};

export default Messages;
