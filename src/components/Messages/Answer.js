import { Fragment } from "react";
import useMessageStore, {
  useProcessController,
} from "../../store/useMessagesStore";
import { GettingStartedLoader } from "../Loaders";
import MarkdownRenderer from "../MarkdownRenderer";

const Answer = ({ message_id }) => {
  const message = useMessageStore((state) => state.data[message_id]);

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
    <div className="text-white max-w-full">
      {message?.answer.map((part) => {
        if (part.type === "text") {
          return <MarkdownRenderer key={part.id} content={part.data} />;
        }
        return <Fragment key={part?.id} />;
      })}
    </div>
  );
};

export default Answer;
