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
      className="px-2 py-1 text-xs inline-flex items-center border border-[#eaeaea] dark:border-[#414141] bg-[#EAEAEA] dark:bg-[#232323] hover:bg-[#EFEFEF] dark:hover:bg-[#252525] active:bg-[#dbdbdb] dark:active:bg-[#1f1f1f] rounded-full no-underline text-inherit"
    >
      <FileIcon />
      <div className="max-w-[100px] truncate ml-1">
        <span>{text}</span>
      </div>
      <FiDownload className="ml-1" />
    </a>
  );
};

export default MdDownloadInlineFile;
