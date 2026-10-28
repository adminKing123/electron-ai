import { convertByteToSize, getFileIcon } from "../../utils/helpers";
import ENDPOINTS from "../../apis/endpoints";
import { FiDownload } from "react-icons/fi";

const MessageFilePreview = ({ fileObj }) => {
  const FileIcon = getFileIcon({
    name: fileObj.original_name,
  });
  const is_image = fileObj.file_type.startsWith("image/");

  const handleDownload = () => {
    if (fileObj.download_url) {
      const link = document.createElement("a");
      link.href = ENDPOINTS.GET_DOWNLOAD_URI(fileObj.download_url);
      link.download = fileObj.original_name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex-shrink-0 relative group cursor-pointer">
      {is_image && fileObj.download_url ? (
        <div className="w-24 h-24 rounded-2xl border bg-white border-ink-150 dark:bg-void-825 dark:border-void-775 overflow-hidden">
          <img
            src={ENDPOINTS.GET_DOWNLOAD_URI(fileObj.download_url)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="relative w-24 h-24 rounded-2xl border flex flex-col items-center justify-center gap-1 p-1 bg-white border-ink-150 dark:bg-void-825 dark:border-void-775 overflow-hidden">
          <FileIcon className="text-3xl text-black/70 dark:text-white/70" />
          <p
            className="text-[11px] truncate w-full text-center px-1 text-ink-950 dark:text-white"
            title={fileObj.original_name}
          >
            {fileObj.original_name}
          </p>
          <p className="text-[10px] text-ink-550 dark:text-ink-400">
            {convertByteToSize(fileObj.size)}
          </p>
        </div>
      )}
      {fileObj.download_url && (
        <button
          onClick={handleDownload}
          className="absolute top-1.5 right-1.5 rounded-lg p-1 hover:bg-ink-100 dark:hover:bg-void-725 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Download file"
        >
          <FiDownload className="text-ink-950 dark:text-white text-base" />
        </button>
      )}
    </div>
  );
};

export default MessageFilePreview;
