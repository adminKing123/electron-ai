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
      className={`my-4 ${
        view === VIEWS.PREVIEW
          ? "rounded-2xl overflow-hidden"
          : "bg-ink-25 dark:bg-void-850 border border-ink-100 dark:border-void-800 rounded-2xl overflow-hidden"
      }`}
    >
      <div
        className={`px-4 py-2.5 flex justify-between items-center ${
          view === VIEWS.CODE
            ? "bg-ink-75 dark:bg-void-825 border-b border-ink-100 dark:border-void-800"
            : ""
        }`}
      >
        <div className="text-[12px] font-medium text-ink-500 dark:text-ink-550 tracking-wide flex items-center gap-2">
          {isLoading ? <BasicLoader /> : <IoCode className="w-[13px] h-[13px]" />}
          HTML
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md
              text-[11px] font-medium
              text-ink-500 dark:text-ink-600
              hover:text-ink-750 dark:hover:text-ink-300
              hover:bg-ink-150 dark:hover:bg-void-800
              transition-colors"
            title="Copy code"
          >
            {copied ? (
              <>
                <MdOutlineDone className="w-[13px] h-[13px] text-green-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <LuCopy className="w-[12px] h-[12px]" />
                <span>Copy</span>
              </>
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
            className="flex items-center bg-ink-150 dark:bg-void-825 rounded-full p-0.5"
          >
            <ToggleGroup.Item
              value={VIEWS.CODE}
              className="p-1.5 rounded-full transition-colors
                data-[state=on]:bg-white dark:data-[state=on]:bg-void-850
                data-[state=on]:shadow-sm
                data-[state=off]:bg-transparent
                text-ink-500 dark:text-ink-550
                data-[state=on]:text-ink-975 dark:data-[state=on]:text-white"
              title="View code"
            >
              <IoCodeSlash size={14} />
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value={VIEWS.PREVIEW}
              className={`p-1.5 rounded-full transition-colors
                data-[state=on]:bg-white dark:data-[state=on]:bg-void-850
                data-[state=on]:shadow-sm
                data-[state=off]:bg-transparent
                text-ink-500 dark:text-ink-550
                data-[state=on]:text-ink-975 dark:data-[state=on]:text-white
                ${ isLoading ? "opacity-40 cursor-not-allowed" : "" }`}
              title={isLoading ? "Loading..." : "Preview"}
              disabled={isLoading}
            >
              <IoPlayOutline size={14} />
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
          <pre className="!m-0 px-4 pt-4 whitespace-pre-wrap break-words text-[11px] font-mono">
            <code>{String(content).replace(/\n$/, "")}</code>
          </pre>
        </div>
      ) : (
        <div>
          <div className="relative rounded-2xl overflow-hidden">
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center
                bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
              title="Fullscreen"
            >
              <BiExpandAlt size={13} />
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
                  className="absolute top-6 right-[29px] z-10 w-8 h-8 flex items-center justify-center
                    bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                  title="Close (Esc)"
                >
                  <IoClose size={16} />
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
