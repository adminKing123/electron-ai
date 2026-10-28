import useMessageStore, {
  useProcessController,
} from "../../store/useMessagesStore";
import { GettingStartedLoader } from "../Loaders";
import MarkdownRenderer from "../MarkdownRenderer";
import AnswerFiles from "./AnswerComponents/AnswerFiles";
import AnswerProcess from "./AnswerComponents/AnswerProcess";
import AnswerSources from "./AnswerComponents/AnswerSources";
import AnswerSteps from "./AnswerComponents/AnswerSteps";
import GeneratedImages from "./AnswerComponents/GeneratedImages";
import Interrupt from "./AnswerComponents/Interrupt";

const Answer = ({ message_id, chat }) => {
  const message = useMessageStore((state) => state.data[message_id]);

  const process = useProcessController(
    (state) => state.message_process?.[message.id],
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
    <div className="max-w-full">
      {message?.steps?.length ? (
        <AnswerSteps steps={message?.steps} message_id={message?.id} />
      ) : null}
      {message?.answer?.map((part) => {
        if (part.type === "text") {
          return (
            <MarkdownRenderer
              key={part.id}
              message_id={message?.id}
              content={part.data}
            />
          );
        } else if (part.type === "generated_images") {
          return <GeneratedImages key={part.id} images={part?.data || []} />;
        }
        return (
          <div
            key={part?.id}
            className="my-3 bg-ink-50 dark:bg-void-850 border border-ink-100 dark:border-void-800 rounded-2xl overflow-hidden"
          >
            <div className="px-4 py-2 bg-ink-75 dark:bg-void-825 border-b border-ink-100 dark:border-void-800 flex justify-between items-center">
              <span className="text-[11px] font-medium text-ink-500 dark:text-ink-550">
                {part.type}
              </span>
            </div>
            <div className="p-4 overflow-auto">
              <pre className="!m-0">
                <code className="text-nowrap text-[11px] text-ink-650 dark:text-ink-500">
                  {JSON.stringify(part.data, null, 2)}
                </code>
              </pre>
            </div>
          </div>
        );
      })}
      {message?.answer_files?.length ? (
        <AnswerFiles
          answer_files={message?.answer_files}
          message_id={message?.id}
        />
      ) : null}
      {message?.sources?.length ? (
        <AnswerSources sources={message?.sources} message_id={message?.id} />
      ) : null}
      {message?.steps?.length ? (
        <AnswerProcess message_id={message_id} steps={message?.steps} />
      ) : null}
      {message?.interrupt?.id ? (
        <Interrupt
          message_id={message_id}
          interrupt={message.interrupt}
          chat={chat}
        />
      ) : null}
    </div>
  );
};

export default Answer;
