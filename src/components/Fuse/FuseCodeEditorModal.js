import React, { useCallback, useEffect, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import useIsDark from "../../hooks/useIsDark";
import FuseCodeEditorModalChrome, { CodeEditorLoadState } from "./FuseCodeEditorModalChrome";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.57.0/min/vs",
  },
});

const MONOACO_OPTIONS = {
  acceptSuggestionOnCommitCharacter: false,
  inlineSuggest: { enabled: false },
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 13,
  padding: { top: 12, bottom: 12 },
};

const cancelBtnClass =
  "px-3.5 py-1.5 rounded-lg text-[13px] font-medium " +
  "text-ink-700 dark:text-ink-400 " +
  "bg-ink-50 dark:bg-void-825 " +
  "hover:bg-ink-100 dark:hover:bg-void-775 transition-colors";

const saveBtnClass =
  "px-3.5 py-1.5 rounded-lg text-[13px] font-semibold " +
  "bg-brand-600 dark:bg-brand-500 shadow-glow " +
  "text-white dark:text-[var(--brand-on-solid)] " +
  "hover:bg-brand-700 dark:hover:bg-brand-600 transition-colors " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export default function FuseCodeEditorModal({
  language = "python",
  initialCode = "",
  variables,
  VariablePicker,
  onSave,
  onClose,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const pickerWrapRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const isDark = useIsDark();
  const editorTheme = isDark ? "vs-dark" : "vs";

  useEffect(() => {
    monacoRef.current?.editor.setTheme(editorTheme);
  }, [editorTheme]);

  useEffect(() => {
    if (!pickerOpen) return;
    const dismiss = (e) => {
      if (pickerWrapRef.current?.contains(e.target)) return;
      setPickerOpen(false);
    };
    document.addEventListener("mousedown", dismiss);
    return () => document.removeEventListener("mousedown", dismiss);
  }, [pickerOpen]);

  const handleMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      editor.setValue(initialCode);
      monaco.editor.setTheme(editorTheme);
      setEditorReady(true);
      editor.focus();
    },
    [initialCode, editorTheme],
  );

  const handleSave = () => {
    onSave(editorRef.current?.getValue() ?? initialCode);
  };

  const insertVariable = (token) => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    if (!selection) return;
    editor.executeEdits("fuse-insert-variable", [
      {
        range: selection,
        text: `{{${token}}}`,
        forceMoveMarkers: true,
      },
    ]);
    editor.focus();
    setPickerOpen(false);
  };

  return (
    <FuseCodeEditorModalChrome
      language={language}
      onClose={onClose}
      header={
        <header
          className="flex items-center gap-2 px-3 py-2.5 shrink-0
            border-b border-ink-100 dark:border-void-800
            bg-ink-50/60 dark:bg-void-850/60"
        >
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className={cancelBtnClass}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!editorReady}
              className={saveBtnClass}
            >
              Save
            </button>
          </div>

          {VariablePicker ? (
            <div ref={pickerWrapRef} className="relative flex-shrink-0 ml-auto">
              <button
                type="button"
                title="Insert variable"
                aria-expanded={pickerOpen}
                disabled={!editorReady}
                className="w-9 h-9 rounded-lg flex items-center justify-center
                  text-[13px] font-mono font-semibold
                  text-ink-650 dark:text-ink-400
                  bg-white dark:bg-void-825
                  ring-1 ring-ink-100 dark:ring-void-800
                  hover:bg-ink-100 dark:hover:bg-void-775
                  transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setPickerOpen((open) => !open);
                }}
              >
                @
              </button>
              {pickerOpen ? (
                <VariablePicker
                  variables={variables}
                  onPick={insertVariable}
                  onClose={() => setPickerOpen(false)}
                />
              ) : null}
            </div>
          ) : null}
        </header>
      }
    >
      <EditorOnlyArea>
        <Editor
          height="100%"
          language={language}
          theme={editorTheme}
          onMount={handleMount}
          loading={<CodeEditorLoadState />}
          options={MONOACO_OPTIONS}
        />
      </EditorOnlyArea>
    </FuseCodeEditorModalChrome>
  );
}

function EditorOnlyArea({ children }) {
  return (
    <div className="relative flex flex-1 min-h-0 w-full">
      <div className="absolute inset-0 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 w-full">{children}</div>
      </div>
    </div>
  );
}
