import { useProcessController } from "../../store/useMessagesStore";
import { GettingStartedLoader } from "../Loaders";
import MarkdownRenderer from "../MarkdownRenderer";

const Answer = ({ message }) => {
  const process = useProcessController(
    (state) => state.message_process?.[message.id]
  );
  if (
    process?.id === message?.id &&
    process?.process_name === "GETTING_STARTED"
  )
    return (
      <div className="min-h-[200px] mt-2">
        <GettingStartedLoader />
      </div>
    );
  return (
    <div className="text-white mt-2 max-w-full">
      <MarkdownRenderer content={message.answer} />
    </div>
  );
};

export default Answer;
