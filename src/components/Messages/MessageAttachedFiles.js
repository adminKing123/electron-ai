import useMessageStore from "../../store/useMessagesStore";
import FilePreview from "../MessageRelatedActionsInPrompt/FilePreview";
import MessageFilePreview from "./MessageFilePreview";

const MessageAttachedFiles = ({ message_id }) => {
  const files = useMessageStore((state) => state.data[message_id]?.files) || [];

  if (files.length === 0) return null;
  return (
    <div className="flex justify-end mt-2">
      <div className="flex flex-wrap gap-2">
        {files.map((file) => (
          <MessageFilePreview key={file.file_id} fileObj={file} />
        ))}
      </div>
    </div>
  );
};

export default MessageAttachedFiles;
