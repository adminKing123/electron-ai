import Answer from "./Answer";
import MessageActions from "./MessageActions";

const Message = ({ message, chat }) => {
  const handleCopy = (callback) => {
    if (message?.answer) {
      navigator.clipboard.writeText(message.answer);
      callback?.(message?.id);
    }
  };

  return (
    <div
      id={message.id}
      className="last:min-h-full max-w-[788px] px-5 mx-auto group"
    >
      <div className="flex justify-end">
        <div className="max-w-full font-sans text-[15px] text-black dark:text-white px-5 py-[10px] bg-[#F4F4F4] dark:bg-[#303030] rounded-3xl w-fit break-words whitespace-pre-wrap">
          {message.prompt}
        </div>
      </div>
      <Answer message={message} />
      <MessageActions
        id={message.id}
        message={message}
        handleCopy={handleCopy}
        chat={chat}
      />
    </div>
  );
};

export default Message;
