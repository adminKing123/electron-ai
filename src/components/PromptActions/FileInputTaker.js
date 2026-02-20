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
        className={`border p-2 rounded-full flex items-center cursor-pointer group disabled:opacity-50`}
      >
        <IoIosAttach className="fill-black dark:fill-white" />
        <span
          className={`text-black dark:text-white text-xs max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:pl-2 group-hover:opacity-100 transition-[max-width,opacity,padding] duration-300`}
        >
          Attach File
        </span>
      </label>
    </div>
  );
};

export default FileInputTaker;
