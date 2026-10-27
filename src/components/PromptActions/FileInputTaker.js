import { v4 as uuidv4 } from "uuid";
import { IoIosAttach } from "react-icons/io";
import { useFileInputStore } from "../../store/usePromptStores";
import { uploadFileAPI } from "../../apis/file_upload/queryFunctions";
import { notifyRenameChatError } from "../../utils/notifier";

const FileInputTaker = ({ inputRef, disabled, chat }) => {
  const chat_id = chat.id;
  const addFile = useFileInputStore((state) => state.addFile);
  const updateFile = useFileInputStore((state) => state.updateFile);
  const removeFile = useFileInputStore((state) => state.removeFile);

  const onProgress = (fileObj, progress) => {
    updateFile(fileObj.id, { progress });
  };

  const onComplete = (fileObj, response) => {
    updateFile(fileObj.id, {
      in_progress: false,
      uploaded: true,
      progress: 100,
      ...response,
    });
  };

  const onError = (fileObj, error) => {
    removeFile(fileObj.id);
    notifyRenameChatError("Failed to upload file: " + (fileObj?.file?.name || "Unknown error"));
    console.error("File upload error:", error);
  };

  const onAbort = (fileObj) => {
    updateFile(fileObj.id, { in_progress: false, abort: null });
  };

  const onStart = (fileObj, abortSignal) => {
    updateFile(fileObj.id, { in_progress: true, abort: abortSignal });
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const fileObj = {
        id: uuidv4(),
        file: file,
        progress: 0,
        uploaded: false,
        in_progress: true,
        abort: null,
      };
      addFile(fileObj);
      uploadFileAPI({
        fileObj,
        chatId: chat_id,
        onProgress,
        onComplete,
        onError,
        onAbort,
        onStart,
      });
    });
    if (inputRef.current) inputRef.current.value = null;
  };

  return (
    <div className="relative">
      <input
        id="file-upload"
        type="file"
        disabled={disabled}
        onChange={handleInputChange}
        className="hidden"
        ref={inputRef}
        multiple
      />
      <label
        htmlFor="file-upload"
        title="Attach File"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-full cursor-pointer
          bg-ink-50 dark:bg-ink-725
          hover:bg-ink-100 dark:hover:bg-ink-700
          text-ink-950 dark:text-white
          transition-colors duration-150"
      >
        <IoIosAttach className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
      </label>
    </div>
  );
};

export default FileInputTaker;
