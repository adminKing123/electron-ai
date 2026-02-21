import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useProcessController } from "../../store/useMessagesStore";
import { LuCopy } from "react-icons/lu";
import { MdOutlineDone } from "react-icons/md";
import { IoCode, IoCodeSlash, IoClose } from "react-icons/io5";
import { IoPlayOutline } from "react-icons/io5";
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
      codeContainerRef.current.scrollTo({
        top: codeContainerRef.current.scrollHeight,
        // behavior: "smooth",
      });
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

  return (
    <div
      className={`my-4 ${view === VIEWS.PREVIEW ? "" : "bg-[#F9F9F9] dark:bg-[#181818] rounded-3xl"} overflow-hidden`}
    >
      <div
        className={`px-[18px] py-2 ${view === VIEWS.PREVIEW ? "" : ""} flex justify-between items-center`}
      >
        <div className="font-semibold text-black dark:text-white text-sm flex items-center gap-2">
          {isLoading ? <BasicLoader /> : <IoCode />}
          HTML
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-base hover:opacity-80 transition-opacity"
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
          <ToggleGroup.Root
            type="single"
            value={view}
            onValueChange={(value) => {
              if (value && !(value === VIEWS.PREVIEW && isLoading)) {
                setView(value);
              }
            }}
            className="flex items-center bg-[#E8E8E8] dark:bg-[#0B0B0B] rounded-full p-1"
          >
            <ToggleGroup.Item
              value={VIEWS.CODE}
              className="p-2 rounded-full transition-colors data-[state=on]:bg-[#ffffff] dark:data-[state=on]:bg-[#212121] data-[state=off]:bg-transparent text-[#6f6f6f] dark:text-[#b0b0b0] data-[state=on]:text-black dark:data-[state=on]:text-white"
              title="View code"
            >
              <IoCodeSlash size={16} />
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value={VIEWS.PREVIEW}
              className={`p-2 rounded-full transition-colors data-[state=on]:bg-[#ffffff] dark:data-[state=on]:bg-[#212121] data-[state=off]:bg-transparent text-[#6f6f6f] dark:text-[#b0b0b0] data-[state=on]:text-black dark:data-[state=on]:text-white ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={isLoading ? "Loading..." : "Preview"}
              disabled={isLoading}
            >
              <IoPlayOutline size={16} />
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>
      </div>

      {isLoading && view === VIEWS.PREVIEW ? (
        <div className="p-4 flex items-center gap-2">
          <BasicLoader /> Loading preview...
        </div>
      ) : view === VIEWS.CODE ? (
        <div ref={codeContainerRef} className="overflow-auto max-h-[500px]">
          <pre className="!m-0 px-4 whitespace-pre-wrap break-words text-sm font-mono">
            <code>{String(content).replace(/\n$/, "")}</code>
          </pre>
        </div>
      ) : (
        <div>
          <div className="relative rounded-3xl overflow-hidden">
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
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
                  className="absolute top-6 right-[29px] z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  title="Close (Esc)"
                >
                  <IoClose size={20} />
                </button>

                <div className="flex-1 sm:m-4 sm:rounded-3xl overflow-hidden shadow-2xl">
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
