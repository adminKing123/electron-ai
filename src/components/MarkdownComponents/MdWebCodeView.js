import { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useProcessController } from "../../store/useMessagesStore";
import { LuCopy } from "react-icons/lu";
import { MdOutlineDone } from "react-icons/md";
import { IoCodeSlash } from "react-icons/io5";
import { VscPreview } from "react-icons/vsc";
import { BiExpandAlt, BiCollapseAlt } from "react-icons/bi";
import { BasicLoader } from "../Loaders";

const VIEWS = {
  CODE: "CODE",
  PREVIEW: "PREVIEW",
};

const MdWebCodeViewRenderer = ({ content, message_id }) => {
  const [view, setView] = useState(VIEWS.CODE);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewContainerRef = useRef(null);

  const process = useProcessController(
    (state) => state.message_process?.[message_id],
  );
  const isLoading = process?.id === message_id;

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await previewContainerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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
        <div className="p-4 overflow-auto max-h-[500px]">
          <SyntaxHighlighter
            language="html"
            useInlineStyles={false}
            style={{}}
            customStyle={{ margin: 0 }}
          >
            {String(content).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <div>
          <div
            ref={previewContainerRef}
            className="relative border border-[#E4E4E4] dark:border-[#454545] rounded-lg overflow-hidden bg-white"
          >
            <button
              onClick={toggleFullscreen}
              className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <BiCollapseAlt size={16} />
              ) : (
                <BiExpandAlt size={16} />
              )}
            </button>
            <iframe
              title="HTML Preview"
              srcDoc={content}
              className={`w-full border-0 ${isFullscreen ? "h-screen" : "min-h-[480px]"}`}
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MdWebCodeViewRenderer;
