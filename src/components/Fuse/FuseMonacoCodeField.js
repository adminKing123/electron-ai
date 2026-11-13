import React, { lazy, Suspense, useMemo, useState } from "react";
import { TbCode, TbPencil } from "react-icons/tb";
import { FuseCodeEditorModalLoading } from "./FuseCodeEditorModalChrome";

const FuseCodeEditorModal = lazy(() => import("./FuseCodeEditorModal"));

function monacoLanguage(field, allValues) {
  const key = field?.languageKey || "language";
  const raw = allValues?.[key] ?? field?.defaultLanguage ?? "python";
  if (raw === "javascript") return "javascript";
  return "python";
}

function previewSnippet(code, maxLines = 8) {
  if (!code) return null;
  const lines = code.split("\n");
  if (lines.length <= maxLines) return code;
  return `${lines.slice(0, maxLines).join("\n")}\n…`;
}

export default function FuseMonacoCodeField({
  field,
  value,
  onChange,
  variables,
  allValues,
  VariablePicker,
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  const language = useMemo(
    () => monacoLanguage(field, allValues),
    [field, allValues],
  );

  const code = value ?? "";
  const lineCount = code ? code.split("\n").length : 0;

  return (
    <>
      <div className="rounded-lg border border-ink-200 dark:border-void-775 overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-ink-50 dark:bg-void-850 border-b border-ink-150 dark:border-void-775">
          <div className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-400">
            <TbCode className="w-4 h-4" />
            <span>
              {code.length === 0 ? "Empty" : `${lineCount} line${lineCount === 1 ? "" : "s"}`}
            </span>
            <span className="capitalize">{language}</span>
          </div>
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
              bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300
              border border-brand-200 dark:border-brand-800/50"
          >
            <TbPencil className="w-3.5 h-3.5" />
            Edit source
          </button>
        </div>
        <pre className="m-0 px-3 py-2 text-xs font-mono max-h-32 overflow-auto whitespace-pre-wrap">
          {code.length === 0 ? (
            <span className="text-ink-450 italic">Click Edit source to add code.</span>
          ) : (
            previewSnippet(code)
          )}
        </pre>
      </div>

      {editorOpen ? (
        <Suspense
          fallback={
            <FuseCodeEditorModalLoading
              language={language}
              onClose={() => setEditorOpen(false)}
            />
          }
        >
          <FuseCodeEditorModal
            key={language}
            language={language}
            initialCode={code}
            variables={variables}
            VariablePicker={VariablePicker}
            onSave={(next) => {
              onChange(next);
              setEditorOpen(false);
            }}
            onClose={() => setEditorOpen(false)}
          />
        </Suspense>
      ) : null}
    </>
  );
}
