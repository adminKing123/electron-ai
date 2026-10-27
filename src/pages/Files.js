import { useEffect, useState } from "react";
import { getFilesAPI } from "../apis/library/queryFunctions";
import { LoadingMessages } from "../components/Loaders";
import ENDPOINTS from "../apis/endpoints";
import { convertByteToSize, getFileIcon } from "../utils/helpers";
import { FiDownload, FiFolder } from "react-icons/fi";
import SectionHeader from "../components/Common/SectionHeader";
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
      <div
        className="relative group cursor-pointer flex flex-col rounded-2xl overflow-hidden
          border border-ink-150 dark:border-ink-800
          bg-white dark:bg-ink-850
          hover:border-brand-200 dark:hover:border-brand-900
          hover:shadow-[0_4px_20px_-8px_rgba(124,58,237,0.25)]
          transition-[border-color,box-shadow]"
      >
        {is_image && fileObj.download_url ? (
          /* ── Image thumbnail ── */
          <div
            className="relative aspect-[4/3] bg-ink-50 dark:bg-ink-825 overflow-hidden"
            onClick={() => setViewerOpen(true)}
          >
            <img
              src={ENDPOINTS.GET_DOWNLOAD_URI(fileObj.download_url)}
              alt={fileObj.original_name}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              loading="lazy"
            />
            {/* Hover overlay with expand icon */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
              <BiExpandAlt className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>
          </div>
        ) : (
          /* ── Non-image file preview ── */
          <div className="aspect-[4/3] flex items-center justify-center bg-ink-50 dark:bg-ink-825">
            <span className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-ink-800 border border-ink-150 dark:border-ink-750">
              <FileIcon className="text-[22px] text-ink-600 dark:text-ink-400" />
            </span>
          </div>
        )}

        {/* ── Footer: name + size ── */}
        <div className="px-3 py-2.5 border-t border-ink-100 dark:border-ink-800 min-w-0">
          <p
            className="text-[12px] font-medium truncate text-ink-875 dark:text-ink-150"
            title={fileObj.original_name}
          >
            {fileObj.original_name}
          </p>
          <p className="text-[11px] text-ink-450 dark:text-ink-550 mt-0.5">
            {convertByteToSize(fileObj.size)}
          </p>
        </div>

        {/* Download button — always shown on hover */}
        {fileObj.download_url && (
          <button
            onClick={handleDownload}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 dark:bg-ink-825/90 backdrop-blur-sm border border-ink-150 dark:border-ink-750 text-ink-650 dark:text-ink-400 hover:text-brand-600 dark:hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
            title="Download file"
          >
            <FiDownload className="w-[14px] h-[14px]" />
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
      <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl border border-dashed border-ink-200 dark:border-ink-750 bg-white/60 dark:bg-ink-850/60">
        <span className="w-11 h-11 rounded-xl flex items-center justify-center bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-3">
          <FiFolder className="w-5 h-5" />
        </span>
        <p className="text-[14px] font-semibold text-ink-875 dark:text-ink-150">No files yet</p>
        <p className="text-[12px] text-ink-500 dark:text-ink-550 mt-1 max-w-[280px]">
          Files you upload or generate in chats will appear here.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
    <div>
      <SectionHeader
        title="Files"
        description="Documents and images shared in your chats"
        action={
          !files.loading && files.data.length > 0 ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium tabular-nums bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 flex-shrink-0">
              {files.data.length} {files.data.length === 1 ? "file" : "files"}
            </span>
          ) : null
        }
      />
      {files.loading ? (
        <LoadingMessages />
      ) : (
        <FilesListing files={files.data} />
      )}
    </div>
  );
};

export default FilesPage;
