import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { BasicLoader } from "../Loaders";
import useFuseStudioStore from "../../store/useFuseStudioStore";

/** Shown while Monaco chunk/CDN loads — fills the editor slot. */
export function CodeEditorLoadState() {
  return (
    <div
      className="flex flex-1 items-center justify-center min-h-0 w-full h-full
        bg-ink-50/80 dark:bg-void-850/80"
      aria-busy="true"
      aria-label="Loading code editor"
    >
      <BasicLoader />
    </div>
  );
}

function useDisableCanvasSpacePanWhileOpen() {
  const setCodeEditorOpen = useFuseStudioStore((s) => s.setCodeEditorOpen);
  useEffect(() => {
    setCodeEditorOpen(true);
    return () => setCodeEditorOpen(false);
  }, [setCodeEditorOpen]);
}

/**
 * Dialog chrome without Monaco — safe to import from the non-lazy bundle path (Suspense fallback).
 */
export default function FuseCodeEditorModalChrome({
  language = "python",
  onClose,
  children,
  header = null,
}) {
  useDisableCanvasSpacePanWhileOpen();

  const languageLabel = language === "javascript" ? "JavaScript" : "Python";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4
        bg-black/40 dark:bg-black/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={`${languageLabel} code editor`}
      aria-busy={!header}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="relative flex flex-col w-full max-w-5xl h-[min(88vh,900px)]
          rounded-2xl overflow-hidden
          bg-white dark:bg-void-825
          border border-ink-100 dark:border-void-800
          shadow-[0_16px_48px_rgba(0,0,0,0.14)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {header}

        <div className="flex flex-1 min-h-0 w-full">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Suspense fallback while `FuseCodeEditorModal.js` code-splits in. */
export function FuseCodeEditorModalLoading({ language, onClose }) {
  return (
    <FuseCodeEditorModalChrome language={language} onClose={onClose}>
      <CodeEditorLoadState />
    </FuseCodeEditorModalChrome>
  );
}
