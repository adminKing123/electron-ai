import { getFileIcon } from "../../utils/helpers";
import { FiDownload } from "react-icons/fi";

const MdDownloadInlineFile = ({ url, children }) => {
  const text = String(children).trim();
  const FileIcon = getFileIcon({
    name: text,
  });

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={text}
      className="px-2 py-1 text-[11px] inline-flex items-center gap-1
        border border-[#e5e5e5] dark:border-[#2e2e2e]
        bg-[#f0f0f0] dark:bg-[#252525]
        hover:bg-[#e8e8e8] dark:hover:bg-[#2a2a2a]
        active:bg-[#e0e0e0] dark:active:bg-[#222]
        rounded-full no-underline
        text-[#555] dark:text-[#aaa]
        transition-colors"
    >
      <FileIcon className="w-[12px] h-[12px] flex-shrink-0" />
      <span className="max-w-[100px] truncate">{text}</span>
      <FiDownload className="w-[11px] h-[11px] flex-shrink-0" />
    </a>
  );
};

export default MdDownloadInlineFile;
