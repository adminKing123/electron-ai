import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  tomorrow,
  prism,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaCheck } from "react-icons/fa6";
import {
  REGEX_MARKDOWN_CODE_REMOVES_NEWLINE,
  LANGUAGE_REGEX,
} from "../constants/regexValues";

const CodeBlock = ({ inline, className, children }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);
  const { theme } = "dark";

  const language = LANGUAGE_REGEX.exec(className || "");
  const code = String(children).replace(
    REGEX_MARKDOWN_CODE_REMOVES_NEWLINE,
    ""
  );

  // Check if this is a single-line code block (not inline)
  const isSingleLineBlock = !inline && !code.includes("\n");

  const handleCopy = async () => {
    try {
      // Get only the code text from the SyntaxHighlighter component
      const codeElement = codeRef.current?.querySelector("pre");
      const textToCopy = codeElement
        ? codeElement.textContent.trim()
        : String(children);

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  if (inline) {
    return (
      <code className="bg-[#F0F4F9] dark:bg-[#000C1D] opacity-100 px-1 py-0.5 rounded text-red-600 dark:text-red-400">
        {children}
      </code>
    );
  }

  // Render single-line code blocks as plain text with monospace font styling
  if (isSingleLineBlock) {
    return (
      <span className="font-['Source_Code_Pro'] text-[#0077AA] dark:text-[#9FABCA] bg-[#F0F4F9] dark:bg-[#3A3E4C] opacity-100 px-2 py-1 rounded-md inline-block my-1">
        {code}
      </span>
    );
  }

  return (
    <div className="relative rounded-md overflow-hidden my-3" ref={codeRef}>
      <SyntaxHighlighter
        style={theme === "dark" ? tomorrow : prism}
        language={language ? language[1] : "text"}
        PreTag="div"
        className="!m-0 text-xs sm:text-sm font-mono"
        customStyle={{
          borderRadius: "0.375rem",
          padding: "1rem",
          border: theme === "dark" ? "1px solid #3c3d3a" : "1px solid #e2e8f0",
          backgroundColor: theme === "dark" ? "#222222" : "#F0F4F9",
        }}
      >
        {code}
      </SyntaxHighlighter>

      {/* Copy Button */}
      <button
        className="flex items-center absolute top-2 right-2 text-xs px-1.5 py-2 bg-white dark:bg-[#3C4043] opacity-100 border-[0.5px] dark:border-[#333333] border-[#DDDDDD] text-[#0D3148] dark:text-[#FFFFFF] rounded-lg"
        onClick={handleCopy}
      >
        {copied ? (
          <div className="flex items-center gap-1 text-[11px]">
            <FaCheck className="w-3 h-3 dark:text-white text-black" />
            <span className="font-sans tracking-normal">Copied</span>
          </div>
        ) : (
          <div className="flex items-center px-1 gap-1">
            <span className="gap-0 text-[11px] tracking-normal flex items-center font-sans">
              Code Copy
            </span>
          </div>
        )}
      </button>
    </div>
  );
};

const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      className="prose dark:prose-invert max-w-none leading-6 sm:leading-7 font-sans text-[15px] my-2"
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="my-1.5 sm:my-3 leading-5">{children}</p>
        ),
        // Use the CodeBlock component for code rendering
        code: CodeBlock,
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-2 py-1 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-300 dark:border-gray-700 px-2 py-1">
            {children}
          </td>
        ),
        ul: ({ children }) => (
          <ul className="list-disc ml-5 sm:ml-6 my-2 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal ml-5 sm:ml-6 my-2 space-y-1">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-5">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-400 dark:border-gray-600 pl-3 italic text-gray-600 dark:text-gray-300 my-3">
            {children}
          </blockquote>
        ),
        hr: () => (
          <hr className="border-t border-gray-300 dark:border-gray-700 my-3" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
