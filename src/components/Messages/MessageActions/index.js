import useMessageStore, {
  useProcessController,
} from "../../../store/useMessagesStore";
import { copyAnswer } from "../../../utils/helpers";
import CopyButton from "./CopyMessageButton";
import DeleteMessageButton from "./DeleteMessageButton";
import GoToMessageTop from "./GoToMessageTop";
import ShowSelectedModel from "./ShowSelectedModel";

const MessageActions = ({ message_id, chat }) => {
  const message = useMessageStore((state) => state.data[message_id]);

  const process = useProcessController(
    (state) => state.message_process?.[message.id]
  );

  const handleAnswerCopy = (callback) => {
    copyAnswer(message, callback);
  };

  if (process?.id === message_id) return null;

  return (
    <div className="my-2 flex items-center justify-between">
      <div className="text-[#5D5D5D] dark:text-white overflow-hidden">
        <CopyButton handleCopy={handleAnswerCopy} />
        <DeleteMessageButton id={message_id} chat={chat} />
        <GoToMessageTop id={message_id} />
      </div>
      <ShowSelectedModel message={message} />
    </div>
  );
};

export default MessageActions;
