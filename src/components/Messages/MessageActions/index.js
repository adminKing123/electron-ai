import { useProcessController } from "../../../store/useMessagesStore";
import CopyButton from "./CopyMessageButton";
import DeleteMessageButton from "./DeleteMessageButton";
import GoToMessageTop from "./GoToMessageTop";
import ShowSelectedModel from "./ShowSelectedModel";

const MessageActions = ({ id, message, handleCopy, chat }) => {
  const process = useProcessController(
    (state) => state.message_process?.[message.id]
  );

  if (process?.id === id) return null;

  return (
    <div className="my-2 flex items-center justify-between">
      <div className="text-[#5D5D5D] dark:text-white overflow-hidden">
        <CopyButton handleCopy={handleCopy} />
        <DeleteMessageButton id={id} chat={chat} />
        <GoToMessageTop id={id} />
      </div>
      <ShowSelectedModel message={message} />
    </div>
  );
};

export default MessageActions;
