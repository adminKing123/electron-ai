import useMessageStore, {
  useProcessController,
} from "../../store/useMessagesStore";
import { GettingStartedLoader } from "../Loaders";
import MarkdownRenderer from "../MarkdownRenderer";
import AnswerFiles from "./AnswerComponents/AnswerFiles";
import AnswerProcess from "./AnswerComponents/AnswerProcess";
import AnswerSources from "./AnswerComponents/AnswerSources";
import AnswerSteps from "./AnswerComponents/AnswerSteps";

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
      {message?.steps?.length ? (
        <AnswerSteps steps={message?.steps} message_id={message?.id} />
      ) : null}
      {message?.answer?.map((part) => {
        if (part.type === "text") {
          return <MarkdownRenderer key={part.id} message_id={message?.id} content={part.data} />;
        }
        return (
          <div
            key={part?.id}
            className="my-4 bg-[#F9F9F9] dark:bg-[#171717] border border-[#E4E4E4] dark:border-[#454545] rounded-2xl overflow-hidden"
          >
            <div className="px-[18px] py-2 bg-[#f1f1f1] dark:bg-[#2F2F2F] rounded-t-2xl flex justify-between items-center">
              <div className="font-bold text-black dark:text-white text-[11px]">
                {part.type}
              </div>
            </div>
            <div className="p-4 overflow-auto">
              <pre className="!m-0">
                <code className="text-nowrap text-[11px]">
                  {JSON.stringify(part.data, null, 2)}
                </code>
              </pre>
            </div>
          </div>
        );
      })}
      {message?.answer_files?.length ? (
        <AnswerFiles answer_files={message?.answer_files} message_id={message?.id} />
      ) : null}
      {message?.sources?.length ? (
        <AnswerSources sources={message?.sources} message_id={message?.id} />
      ) : null}
      {message?.steps?.length ? (
        <AnswerProcess message_id={message_id} steps={message?.steps} />
      ) : null}
    </div>
  );
};

export default Answer;
