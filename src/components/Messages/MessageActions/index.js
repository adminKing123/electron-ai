import useMessageStore from "../../../store/useMessagesStore";
import CopyButton from "./CopyMessageButton";
import DeleteMessageButton from "./DeleteMessageButton";

const MessageActions = ({ id, handleCopy }) => {
  const { process } = useMessageStore();

  if (process?.id === id) return null;

  return (
    <div className="mt-2 mb-[30px] text-white overflow-hidden opacity-0 group-hover:opacity-100">
      <CopyButton handleCopy={handleCopy} />
      <DeleteMessageButton id={id} />
    </div>
  );
};

export default MessageActions;
