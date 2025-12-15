import { MdClose } from "react-icons/md";
import { useFileInputStore } from "../../store/usePromptStores";
import { convertByteToSize, getFileIcon } from "../../utils/helpers";
import { removeFileAPI } from "../../apis/file_upload/queryFunctions";
import ENDPOINTS from "../../apis/endpoints";

const FilePreview = ({ fileId }) => {
  const fileObj = useFileInputStore((state) => state.attachedFiles[fileId]);
  const FileIcon = getFileIcon(fileObj.file);
  const removeFile = useFileInputStore((state) => state.removeFile);
  const in_progress = fileObj?.in_progress ? true : false;
  const progress = fileObj?.progress ? fileObj.progress : 0;

  const is_image = fileObj.file.type.startsWith("image/");

  const onRemove = (e) => {
    e.stopPropagation();
    removeFile(fileObj.id);
    fileObj?.abort?.();
    if (fileObj.download_url) removeFileAPI(fileObj.filename);
  };

  return (
    <div className="flex-shrink-0 relative group cursor-pointer">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 z-10 p-1 rounded-lg shadow-lg bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <MdClose className="text-xs" />
      </button>
      {is_image && fileObj.download_url ? (
        <div className="w-24 h-24 rounded-2xl border bg-white border-gray-200 dark:bg-[#1e1e1e] dark:border-[#2f2f2f] overflow-hidden">
          <img
            src={ENDPOINTS.GET_DOWNLOAD_URI(fileObj.download_url)}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="relative w-24 h-24 rounded-2xl border flex flex-col items-center justify-center gap-1 p-1 bg-white border-gray-200 dark:bg-[#1e1e1e] dark:border-[#2f2f2f] overflow-hidden">
          <FileIcon className="text-3xl text-black/70 dark:text-white/70" />
          <p
            className="text-[9px] truncate w-full text-center px-1 text-black dark:text-white"
            title={fileObj.file.name}
          >
            {fileObj.file.name}
          </p>
          <p className="text-[8px] text-gray-500 dark:text-gray-400">
            {convertByteToSize(fileObj.file.size)}
          </p>
          {in_progress && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300 dark:bg-[#3a3a3a]">
              <div
                className="h-1 bg-black dark:bg-white transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilePreview;
