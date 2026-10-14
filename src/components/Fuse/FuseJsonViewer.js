import React, { useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

function toJsonString(value) {
  if (value == null) return "";
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/**
 * Syntax-highlighted JSON for Fuse run panels (react-syntax-highlighter / Prism).
 */
export default function FuseJsonViewer({ value, className = "" }) {
  const code = useMemo(() => toJsonString(value), [value]);

  if (!code) return null;

  return (
    <div
      className={`rounded-lg overflow-x-auto border border-[#e8e8e8] dark:border-[#2a2a2a]
        bg-[#f7f7f7] dark:bg-[#1a1a1a] ${className}`}
    >
      <SyntaxHighlighter
        language="json"
        useInlineStyles={false}
        style={{}}
        customStyle={{
          margin: 0,
          padding: "12px",
          background: "transparent",
          fontSize: "11.5px",
          lineHeight: 1.55,
        }}
        codeTagProps={{ className: "font-mono" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
