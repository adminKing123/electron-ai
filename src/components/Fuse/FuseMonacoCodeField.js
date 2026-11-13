import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import useThemeStore, { THEME_OPTIONS } from "../../store/useThemeStore";

/** Load Monaco from CDN so it stays out of the main bundle (lazy + smaller builds). */
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.57.0/min/vs",
  },
});

const MONACO_LANG = {
  python: "python",
  javascript: "javascript",
};

const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 13,
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: "on",
  padding: { top: 8, bottom: 8 },
  renderLineHighlight: "gutter",
  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
};

const VARIABLE_BTN_CLASS =
  "flex-shrink-0 w-8 h-8 mt-0.5 flex items-center justify-center rounded-lg " +
  "text-[12px] font-mono font-bold text-ink-500 dark:text-ink-550 " +
  "border border-ink-200 dark:border-void-775 " +
  "hover:text-brand-600 dark:hover:text-brand-400 " +
  "hover:border-brand-200 dark:hover:border-brand-800/50 " +
  "hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors";

function resolveEditorLanguage(field, allValues) {
  const key = field.languageKey || "language";
  const raw = allValues?.[key] ?? field.defaultLanguage ?? "python";
  return MONACO_LANG[raw] || "python";
}

/**
 * Monaco-based code field for Fuse forms (lazy-loaded from FormBuilder).
 * VariablePicker is injected from FormBuilder to avoid duplicating the picker UI.
 */
export default function FuseMonacoCodeField({
  field,
  value,
  onChange,
  variables,
  allValues,
  VariablePicker,
}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const theme = useThemeStore((s) => s.theme);
  const monacoTheme = theme === THEME_OPTIONS.DARK ? "vs-dark" : "vs";
  const language = useMemo(
    () => resolveEditorLanguage(field, allValues),
    [field, allValues],
  );
  const height = Number(field.editorHeight) > 0 ? Number(field.editorHeight) : 280;

  useEffect(() => {
    if (!pickerOpen) return;
    const onOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [pickerOpen]);

  const insertVariable = useCallback(
    (token) => {
      const snippet = `{{${token}}}`;
      const editor = editorRef.current;
      if (editor) {
        const selection = editor.getSelection();
        const range = selection ?? {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
        };
        editor.executeEdits("fuse-variable", [
          { range, text: snippet, forceMoveMarkers: true },
        ]);
        onChange(editor.getValue());
        editor.focus();
      } else {
        onChange(`${value ?? ""}${snippet}`);
      }
      setPickerOpen(false);
    },
    [onChange, value],
  );

  const handleMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-start gap-1.5">
        <div
          className="flex-1 min-w-0 rounded-lg overflow-hidden border border-ink-200 dark:border-void-775
            bg-white dark:bg-void-850"
        >
          <Editor
            height={height}
            language={language}
            theme={monacoTheme}
            value={value ?? ""}
            onChange={onChange}
            onMount={handleMount}
            loading={
              <div
                className="flex items-center justify-center text-[12px] text-ink-500 dark:text-ink-550"
                style={{ height }}
              >
                Loading editor…
              </div>
            }
            options={EDITOR_OPTIONS}
          />
        </div>
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
      </div>
      {pickerOpen && VariablePicker ? (
        <VariablePicker
          variables={variables}
          onPick={insertVariable}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  );
}
