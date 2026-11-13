import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Editor from "@monaco-editor/react";
import useThemeStore, { THEME_OPTIONS } from "../../store/useThemeStore";
import { FUSE_MONACO_EDITOR_OPTIONS } from "./fuseMonacoSetup";

const MODAL_EDITOR_HEIGHT = "min(68vh, 520px)";

const VARIABLE_BTN_CLASS =
  "flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg " +
  "text-[12px] font-mono font-bold text-ink-500 dark:text-ink-550 " +
  "border border-ink-200 dark:border-void-775 " +
  "hover:text-brand-600 dark:hover:text-brand-400 " +
  "hover:border-brand-200 dark:hover:border-brand-800/50 " +
  "hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors";

/**
 * Full-screen-friendly modal for editing workflow source code in Monaco.
 * Portaled to document.body so keyboard shortcuts are not captured by the canvas / form.
 */
export default function FuseCodeEditorModal({
  title = "Edit source",
  language,
  initialCode,
  variables,
  VariablePicker,
  onSave,
  onClose,
}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const pickerAnchorRef = useRef(null);

  const [draft, setDraft] = useState(initialCode ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const theme = useThemeStore((s) => s.theme);
  const monacoTheme = theme === THEME_OPTIONS.DARK ? "vs-dark" : "vs";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onOutside = (e) => {
      if (pickerAnchorRef.current?.contains(e.target)) return;
      setPickerOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [pickerOpen]);

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.setValue(initialCode ?? "");
    editor.focus();
    editor.onDidChangeModelContent(() => {
      setDraft(editor.getValue());
    });
  }, [initialCode]);

  useEffect(() => {
    monacoRef.current?.editor.setTheme(monacoTheme);
  }, [monacoTheme]);

  const insertVariable = useCallback((token) => {
    const editor = editorRef.current;
    const snippet = `{{${token}}}`;
    if (!editor) {
      setDraft((prev) => `${prev}${snippet}`);
      setPickerOpen(false);
      return;
    }
    const selection = editor.getSelection();
    const range = selection ?? {
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
    };
    editor.executeEdits("fuse-variable", [{ range, text: snippet, forceMoveMarkers: true }]);
    setDraft(editor.getValue());
    editor.focus();
    setPickerOpen(false);
  }, []);

  const handleSave = () => {
    const code = editorRef.current?.getValue() ?? draft;
    onSave(code);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6
        bg-black/45 dark:bg-black/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fuse-code-editor-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        className="w-full max-w-[min(96vw,880px)] flex flex-col max-h-[92vh] rounded-2xl
          bg-white dark:bg-void-825 border border-ink-150 dark:border-void-800
          shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 flex-shrink-0">
          <div className="min-w-0">
            <h2
              id="fuse-code-editor-title"
              className="text-[16px] font-semibold text-ink-975 dark:text-white"
            >
              {title}
            </h2>
            <p className="text-[12px] text-ink-500 dark:text-ink-550 mt-1">
              {language === "javascript" ? "JavaScript" : "Python"} — Ctrl+A, Tab, and other editor
              shortcuts work here. Use @ to insert a variable.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium
              text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-void-775"
          >
            Cancel
          </button>
        </div>

        <div className="px-5 pb-3 flex-1 min-h-0 flex flex-col">
          <div className="flex items-start gap-2 flex-1 min-h-0">
            <div
              className="flex-1 min-w-0 rounded-xl overflow-hidden border border-ink-200 dark:border-void-775
                bg-white dark:bg-void-850"
              style={{ height: MODAL_EDITOR_HEIGHT }}
            >
              <Editor
                height={MODAL_EDITOR_HEIGHT}
                defaultLanguage={language}
                theme={monacoTheme}
                onMount={handleMount}
                loading={
                  <div
                    className="flex items-center justify-center text-[12px] text-ink-500 dark:text-ink-550 h-full"
                  >
                    Loading editor…
                  </div>
                }
                options={FUSE_MONACO_EDITOR_OPTIONS}
              />
            </div>
            <div ref={pickerAnchorRef} className="relative flex-shrink-0">
              <button
                type="button"
                title="Insert variable"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setPickerOpen((o) => !o);
                }}
                className={VARIABLE_BTN_CLASS}
              >
                @
              </button>
              {pickerOpen && VariablePicker ? (
                <VariablePicker
                  variables={variables}
                  onPick={insertVariable}
                  onClose={() => setPickerOpen(false)}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-ink-100 dark:border-void-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium
              text-ink-700 dark:text-ink-350 border border-ink-200 dark:border-void-775
              hover:bg-ink-50 dark:hover:bg-void-775"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold
              bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
