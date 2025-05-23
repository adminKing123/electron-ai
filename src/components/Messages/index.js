import { useEffect } from "react";
import useMessageStore from "../../store/useMessagesStore";
import Message from "./Message";

const Messages = ({ chat_id }) => {
  const { messages } = useMessageStore();

  useEffect(() => {
    const promptEle = document.getElementById("prompt-container");
    if (messages.length) promptEle.classList.remove("screen-center");
    else promptEle.classList.add("screen-center");
  }, [messages.length]);

  return (
    <div
      className={`overflow-y-auto transition-all duration-500 flex-grow`}
      id="messages-container"
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} chat_id={chat_id} />
      ))}
    </div>
  );
};

export default Messages;
