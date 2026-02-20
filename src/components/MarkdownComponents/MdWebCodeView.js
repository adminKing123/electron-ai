import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useProcessController } from "../../store/useMessagesStore";
import { LuCopy } from "react-icons/lu";
import { MdOutlineDone } from "react-icons/md";
import { IoCodeSlash, IoClose } from "react-icons/io5";
import { VscPreview } from "react-icons/vsc";
import { BiExpandAlt } from "react-icons/bi";
import { BasicLoader } from "../Loaders";

const VIEWS = {
  CODE: "CODE",
  PREVIEW: "PREVIEW",
};

const LINK_HANDLER_SCRIPT = `
<script>
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    
    if (href.startsWith('#')) {
      return;
    }
    
    
    if (href.startsWith('http://') || href.startsWith('https://')) {
      e.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    
    
    e.preventDefault();
  });
</script>
`;

const useHtmlPreviewUrl = (htmlContent, isActive) => {
  const [blobUrl, setBlobUrl] = useState(null);

  const enhancedHtml = useMemo(() => {
    if (!htmlContent || !isActive) return null;

    if (htmlContent.includes("</body>")) {
      return htmlContent.replace("</body>", `${LINK_HANDLER_SCRIPT}</body>`);
    } else if (htmlContent.includes("</html>")) {
      return htmlContent.replace("</html>", `${LINK_HANDLER_SCRIPT}</html>`);
    } else {
      return htmlContent + LINK_HANDLER_SCRIPT;
    }
  }, [htmlContent, isActive]);

  useEffect(() => {
    if (!enhancedHtml) {
      setBlobUrl(null);
      return;
    }

    const blob = new Blob([enhancedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [enhancedHtml]);

  return blobUrl;
};

const MdWebCodeViewRenderer = ({ content, message_id }) => {
  const [view, setView] = useState(VIEWS.CODE);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const codeContainerRef = useRef(null);

  const process = useProcessController(
    (state) => state.message_process?.[message_id],
  );
  const isLoading = process?.id === message_id;

  const blobUrl = useHtmlPreviewUrl(
    content,
    view === VIEWS.PREVIEW && !isLoading,
  );

  useEffect(() => {
    if (isLoading && view === VIEWS.CODE && codeContainerRef.current) {
      codeContainerRef.current.scrollTop =
        codeContainerRef.current.scrollHeight;
    }
  }, [content, isLoading, view]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const handleCopy = async () => {
    if (copied) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getButtonClasses = (btnView) =>
    `p-1.5 rounded transition-colors ${
      view === btnView
        ? "bg-[#E4E4E4] dark:bg-[#454545] text-black dark:text-white"
        : "text-gray-500 dark:text-gray-400 hover:bg-[#E4E4E4] dark:hover:bg-[#3A3A3A]"
    }`;

  return (
    <div
      className={`my-4 ${view === VIEWS.PREVIEW ? "" : "bg-[#F9F9F9] dark:bg-[#171717] border border-[#E4E4E4] dark:border-[#454545] rounded-2xl"} overflow-hidden`}
    >
      <div
        className={`px-[18px] py-2 ${view === VIEWS.PREVIEW ? "" : "bg-[#f1f1f1] dark:bg-[#1d1d1d] rounded-t-2xl"} flex justify-between items-center`}
      >
        <div className="font-bold text-black dark:text-white text-sm">HTML</div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
            title="Copy code"
          >
            {copied ? (
              <>
                <MdOutlineDone className="text-green-500" />
                <span className="text-xs">Copied</span>
              </>
            ) : (
              <LuCopy />
            )}
          </button>

          <div className="w-px h-4 bg-[#E4E4E4] dark:bg-[#454545]" />

          <button
            onClick={() => setView(VIEWS.CODE)}
            className={getButtonClasses(VIEWS.CODE)}
            title="View code"
          >
            <IoCodeSlash size={16} />
          </button>

          <button
            onClick={() => !isLoading && setView(VIEWS.PREVIEW)}
            className={`${getButtonClasses(VIEWS.PREVIEW)} ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={isLoading ? "Loading..." : "Preview"}
            disabled={isLoading}
          >
            <VscPreview size={16} />
          </button>
        </div>
      </div>

      {isLoading && view === VIEWS.PREVIEW ? (
        <div className="p-4 flex items-center gap-2">
          <BasicLoader /> Loading preview...
        </div>
      ) : view === VIEWS.CODE ? (
        <div ref={codeContainerRef} className="p-4 overflow-auto max-h-[500px]">
          <pre className="m-0 whitespace-pre-wrap break-words text-sm font-mono">
            <code>{String(content).replace(/\n$/, "")}</code>
          </pre>
        </div>
      ) : (
        <div>
          <div className="relative border border-[#E4E4E4] dark:border-[#454545] rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded transition-colors"
              title="Fullscreen"
            >
              <BiExpandAlt size={16} />
            </button>
            <iframe
              title="HTML Preview"
              src={blobUrl}
              className="w-full border-0 min-h-[480px]"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>

          {isFullscreen &&
            createPortal(
              <div className="fixed inset-0 z-[9999] backdrop-blur-md bg-black/20 flex flex-col">
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="absolute top-4 right-4 z-10 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded transition-colors"
                  title="Close (Esc)"
                >
                  <IoClose size={20} />
                </button>

                <div className="flex-1 bg-white m-4 rounded-lg overflow-hidden shadow-2xl">
                  <iframe
                    title="HTML Preview Fullscreen"
                    src={blobUrl}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  />
                </div>
              </div>,
              document.body,
            )}
        </div>
      )}
    </div>
  );
};

export default MdWebCodeViewRenderer;
