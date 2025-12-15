import { useFileInputStore } from "../../store/usePromptStores";
import FilePreview from "./FilePreview";

const AttachFilesPreview = ({ fileInputRef }) => {
  const attachedFiles = useFileInputStore((state) => state.attachedFiles);
  const files = Object.values(attachedFiles);

  if (files.length === 0) return null;
  return (
    <div className="px-2 pt-2">
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {files.map((fileObj) => (
          <FilePreview key={fileObj.id} fileId={fileObj.id} />
        ))}
      </div>
    </div>
  );
};

export default AttachFilesPreview;
