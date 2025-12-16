import { convertByteToSize, getFileIcon } from "../../utils/helpers";
import ENDPOINTS from "../../apis/endpoints";

const MessageFilePreview = ({ fileObj }) => {
  const FileIcon = getFileIcon({
    name: fileObj.original_name,
  });
  const is_image = fileObj.file_type.startsWith("image/");

  return (
    <div className="flex-shrink-0 relative group cursor-pointer">
      {is_image && fileObj.download_url ? (
        <div className="w-24 h-24 rounded-2xl border bg-white border-gray-200 dark:bg-[#1e1e1e] dark:border-[#2f2f2f] overflow-hidden">
          <img
            src={ENDPOINTS.GET_DOWNLOAD_URI(fileObj.download_url)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="relative w-24 h-24 rounded-2xl border flex flex-col items-center justify-center gap-1 p-1 bg-white border-gray-200 dark:bg-[#1e1e1e] dark:border-[#2f2f2f] overflow-hidden">
          <FileIcon className="text-3xl text-black/70 dark:text-white/70" />
          <p
            className="text-[9px] truncate w-full text-center px-1 text-black dark:text-white"
            title={fileObj.original_name}
          >
            {fileObj.original_name}
          </p>
          <p className="text-[8px] text-gray-500 dark:text-gray-400">
            {convertByteToSize(fileObj.size)}
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageFilePreview;
