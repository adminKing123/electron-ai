import MarkdownRenderer from "../MarkdownRenderer";
import MessageActions from "./MessageActions";

const Message = ({ message, chat_id }) => {
  const handleCopy = (callback) => {
    if (message?.answer) {
      navigator.clipboard.writeText(message.answer);
      callback?.(message?.id);
    }
  };

  return (
    <div
      id={message.id}
      className="last:min-h-full max-w-[768px] px-5 md:px-0 md:mx-auto group"
    >
      <div className="flex justify-end">
        <pre className="font-sans text-[15px] text-white px-5 py-[15px] bg-[#303030] rounded-3xl w-fit border-[2px] border-[#1c1e21] break-words whitespace-pre-wrap">
          {message.prompt}
        </pre>
      </div>
      {message?.answer ? (
        <div className="text-white mt-2">
          <MarkdownRenderer content={message.answer} />
        </div>
      ) : null}
      <MessageActions
        id={message.id}
        message={message}
        handleCopy={handleCopy}
        chat_id={chat_id}
      />
    </div>
  );
};

export default Message;
