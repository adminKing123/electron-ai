import useMessageStore, {
  useProcessController,
} from "../../../store/useMessagesStore";
import { copyAnswer } from "../../../utils/helpers";
import MessageInfo from "../MessageInfo";
import CopyButton from "./CopyMessageButton";

import GoToMessageTop from "./GoToMessageTop";
import PrintMessageButton from "./PrintMessageButton";
import ShowSelectedModel from "./ShowSelectedModel";
import TextToSpeechButton from "./TextToSpeechButton";

const MessageActions = ({ message_id, chat }) => {
  const message = useMessageStore((state) => state.data[message_id]);

  const process = useProcessController(
    (state) => state.message_process?.[message.id],
  );

  const handleAnswerCopy = (callback) => {
    copyAnswer(message, callback);
  };

  if (process?.id === message_id || message?.interrupt?.id) return null;

  return (
    <div className="mt-1 mb-3" id={`message-actions-${message_id}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <CopyButton handleCopy={handleAnswerCopy} />
          <TextToSpeechButton message={message} />
          <PrintMessageButton message_id={message_id} />
          <GoToMessageTop id={message_id} />
        </div>
        <ShowSelectedModel message={message} />
      </div>
      <MessageInfo message={message} />
    </div>
  );
};

export default MessageActions;
