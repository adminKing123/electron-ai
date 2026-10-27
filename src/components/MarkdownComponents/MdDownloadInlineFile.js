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
        border border-ink-150 dark:border-ink-775
        bg-ink-75 dark:bg-ink-825
        hover:bg-ink-100 dark:hover:bg-ink-800
        active:bg-ink-150 dark:active:bg-ink-875
        rounded-full no-underline
        text-ink-650 dark:text-ink-400
        transition-colors"
    >
      <FileIcon className="w-[12px] h-[12px] flex-shrink-0" />
      <span className="max-w-[100px] truncate">{text}</span>
      <FiDownload className="w-[11px] h-[11px] flex-shrink-0" />
    </a>
  );
};

export default MdDownloadInlineFile;
