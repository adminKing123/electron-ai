import { MdClose } from "react-icons/md";
import { useFileInputStore } from "../../store/usePromptStores";
import { convertByteToSize, getFileIcon } from "../../utils/helpers";

const FilePreview = ({ fileObj }) => {
  const FileIcon = getFileIcon(fileObj.file);
  const removeFile = useFileInputStore((state) => state.removeFile);

  const onRemove = (e) => {
    e.stopPropagation();
    removeFile(fileObj.id);
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
      <div className="w-24 h-24 rounded-2xl border flex flex-col items-center justify-center gap-1 p-1 relative bg-white border-gray-200 dark:bg-[#1e1e1e] dark:border-[#2f2f2f]">
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
        {fileObj.progress > 0 && fileObj.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-lg bg-gray-300 dark:bg-black/60">
            <div className="h-full transition-all duration-300 rounded-bl-lgbg-gray-800 dark:bg-white" style={{ width: `${fileObj.progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
};

const AttachFilesPreview = ({ fileInputRef }) => {
  const files = useFileInputStore((state) => state.attachedFiles);
  if (files.length === 0) return null;
  return (
    <div className="px-2 pt-2">
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {files.map((fileObj) => (
          <FilePreview key={fileObj.id} fileObj={fileObj} />
        ))}
      </div>
    </div>
  );
};

export default AttachFilesPreview;
