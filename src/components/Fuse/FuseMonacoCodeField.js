import React, { lazy, Suspense, useMemo, useState } from "react";
import { TbCode, TbPencil } from "react-icons/tb";
import { resolveMonacoLanguage } from "./fuseMonacoSetup";

const FuseCodeEditorModal = lazy(() => import("./FuseCodeEditorModal"));

function lineCount(text) {
  if (!text) return 0;
  return text.split("\n").length;
}

function previewText(text, maxLines = 8) {
  const src = text ?? "";
  if (!src) return "";
  const lines = src.split("\n");
  if (lines.length <= maxLines) return src;
  return `${lines.slice(0, maxLines).join("\n")}\n…`;
}

/**
 * Form field: compact preview + modal Monaco editor (avoids hotkey conflicts in the config panel).
 */
export default function FuseMonacoCodeField({
  field,
  value,
  onChange,
  variables,
  allValues,
  VariablePicker,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const language = useMemo(
    () => resolveMonacoLanguage(field, allValues),
    [field, allValues],
  );

  const code = value ?? "";
  const lines = lineCount(code);
  const preview = previewText(code);
  const empty = code.length === 0;

  return (
    <>
      <div className="rounded-lg border border-ink-200 dark:border-void-775 bg-ink-50/50 dark:bg-void-850/80 overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-ink-150 dark:border-void-775 bg-white/80 dark:bg-void-825/80">
          <div className="flex items-center gap-2 min-w-0">
            <TbCode className="w-4 h-4 flex-shrink-0 text-ink-500 dark:text-ink-450" />
            <span className="text-[12px] font-medium text-ink-700 dark:text-ink-300 truncate">
              {empty ? "No source yet" : `${lines} line${lines === 1 ? "" : "s"}`}
            </span>
            <span className="text-[11px] text-ink-450 dark:text-ink-550 capitalize">{language}</span>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40
              border border-brand-200 dark:border-brand-800/50
              hover:bg-brand-100 dark:hover:bg-brand-900/35 transition-colors flex-shrink-0"
          >
            <TbPencil className="w-3.5 h-3.5" />
            Edit source
          </button>
        </div>
        <pre
          className="px-3 py-2.5 text-[12px] leading-relaxed font-mono text-ink-800 dark:text-ink-200
            max-h-[140px] overflow-auto whitespace-pre-wrap break-words m-0"
        >
          {empty ? (
            <span className="text-ink-450 dark:text-ink-550 italic">
              {field.placeholder?.split("\n")[0] || "Open the editor to write code…"}
            </span>
          ) : (
            preview
          )}
        </pre>
      </div>

      {modalOpen ? (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
              <span className="text-[13px] text-white">Loading editor…</span>
            </div>
          }
        >
          <FuseCodeEditorModal
            title={field.label ? `Edit — ${field.label}` : "Edit source"}
            language={language}
            initialCode={code}
            variables={variables}
            VariablePicker={VariablePicker}
            onSave={(next) => {
              onChange(next);
              setModalOpen(false);
            }}
            onClose={() => setModalOpen(false)}
          />
        </Suspense>
      ) : null}
    </>
  );
}
