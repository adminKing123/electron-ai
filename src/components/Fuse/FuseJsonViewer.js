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
export default function FuseJsonViewer({ value }) {
  const code = useMemo(() => toJsonString(value), [value]);

  if (!code) return null;

  return (
    <SyntaxHighlighter
      language="json"
      useInlineStyles={false}
      style={{}}
      customStyle={{
        margin: 0,
        padding: "12px 0",
        background: "transparent",
        fontSize: "12px",
        lineHeight: 1.55,
      }}
      codeTagProps={{ className: "font-mono" }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
