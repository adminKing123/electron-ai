import useMessageStore from "../../store/useMessagesStore";
import Message from "./Message";

const Messages = () => {
  const { messages } = useMessageStore();
  return (
    <div
      className={`overflow-y-auto transition-all duration-500 ${
        messages.length ? "flex-grow min-h-[40%]" : "h-[40%]"
      }`}
      id="messages-container"
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};

export default Messages;
