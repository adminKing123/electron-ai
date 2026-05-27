import { useFileInputStore } from "../../store/usePromptStores";
import FilePreview from "./FilePreview";

const AttachFilesPreview = ({ fileInputRef }) => {
  const attachedFiles = useFileInputStore((state) => state.attachedFiles);
  const files = Object.values(attachedFiles);

  if (files.length === 0) return null;
  return (
    <div className="px-3 pt-3">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {files.map((fileObj) => (
          <FilePreview key={fileObj.id} fileId={fileObj.id} />
        ))}
      </div>
    </div>
  );
};

export default AttachFilesPreview;
