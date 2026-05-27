import { useEffect, useState } from "react";
import { getFilesAPI } from "../apis/library/queryFunctions";
import { LoadingMessages } from "../components/Loaders";
import ENDPOINTS from "../apis/endpoints";
import { convertByteToSize, getFileIcon } from "../utils/helpers";
import { FiDownload } from "react-icons/fi";
import { BiExpandAlt } from "react-icons/bi";
import ImageViewer from "../components/Common/ImageViewer";

/**
 * Single file card — image thumbnails open in the fullscreen ImageViewer,
 * non-image files show an icon with name + size. Both support a download button.
 */
const FilePreview = ({ file }) => {
  const fileObj = file.meta_data;
  const FileIcon = getFileIcon({ name: fileObj.original_name });
  const is_image = fileObj.file_type.startsWith("image/");
  const [viewerOpen, setViewerOpen] = useState(false);

  const handleDownload = (e) => {
    e.stopPropagation();
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
    <>
      <div className="flex-shrink-0 relative group cursor-pointer">
        {is_image && fileObj.download_url ? (
          /* ── Image thumbnail ── */
          <div
            className="aspect-square rounded-2xl border border-[#e8e8e8] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] overflow-hidden"
            onClick={() => setViewerOpen(true)}
          >
            <img
              src={ENDPOINTS.GET_DOWNLOAD_URI(fileObj.download_url)}
              alt={fileObj.original_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Hover overlay with expand icon */}
            <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <BiExpandAlt className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>
          </div>
        ) : (
          /* ── Non-image file card ── */
          <div className="aspect-square rounded-2xl border border-[#e8e8e8] dark:border-[#2a2a2a] flex flex-col items-center justify-center gap-1.5 p-2 bg-white dark:bg-[#1e1e1e] overflow-hidden">
            <FileIcon className="text-[28px] text-[#555] dark:text-[#aaa]" />
            <p
              className="text-[9px] font-medium truncate w-full text-center px-1 text-[#333] dark:text-[#ccc]"
              title={fileObj.original_name}
            >
              {fileObj.original_name}
            </p>
            <p className="text-[8px] text-[#aaa] dark:text-[#666]">
              {convertByteToSize(fileObj.size)}
            </p>
          </div>
        )}

        {/* Download button — always shown on hover */}
        {fileObj.download_url && (
          <button
            onClick={handleDownload}
            className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm border border-[#e8e8e8] dark:border-[#2a2a2a] text-[#555] dark:text-[#aaa] hover:text-[#111] dark:hover:text-white hover:bg-white dark:hover:bg-[#2a2a2a] opacity-0 group-hover:opacity-100 transition-all"
            title="Download file"
          >
            <FiDownload className="w-[13px] h-[13px]" />
          </button>
        )}
      </div>

      {/* Fullscreen viewer for image files */}
      {is_image && fileObj.download_url && (
        <ImageViewer
          src={ENDPOINTS.GET_DOWNLOAD_URI(fileObj.download_url)}
          alt={fileObj.original_name}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
};

/**
 * Renders either an empty state message or the responsive file grid.
 */
const FilesListing = ({ files }) => {
  if (files.length === 0) {
    return (
      <p className="text-[13px] text-[#aaa] dark:text-[#555]">No files found.</p>
    );
  }
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {files.map((file) => (
        <FilePreview key={file.id} file={file} />
      ))}
    </div>
  );
};

const FilesPage = () => {
  const [files, setFiles] = useState({
    loading: true,
    data: [],
  });

  useEffect(() => {
    const getInitialData = async () => {
      const data = await getFilesAPI("root");
      setFiles({ loading: false, data });
    };
    getInitialData();
  }, []);

  return (
    <div className="mt-6">
      {files.loading ? (
        <LoadingMessages />
      ) : (
        <FilesListing files={files.data} />
      )}
    </div>
  );
};

export default FilesPage;
