import { loader } from "@monaco-editor/react";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.57.0/min/vs",
  },
});

export const MONACO_LANG = {
  python: "python",
  javascript: "javascript",
};

export const FUSE_MONACO_EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 13,
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: "on",
  padding: { top: 10, bottom: 10 },
  renderLineHighlight: "gutter",
  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
  formatOnType: false,
  formatOnPaste: false,
  autoIndent: "none",
  acceptSuggestionOnCommitCharacter: false,
  tabCompletion: "off",
};

export function resolveMonacoLanguage(field, allValues) {
  const key = field?.languageKey || "language";
  const raw = allValues?.[key] ?? field?.defaultLanguage ?? "python";
  return MONACO_LANG[raw] || "python";
}
