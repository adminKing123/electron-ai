import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import MdCode from "./MarkdownComponents/MdCode";
import { MdImage } from "react-icons/md";

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: ({ node, ...props }) => <MdImage {...props} />,
          ul: ({ children }) => (
            <ul className="revert-list-style">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="revert-list-style">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="revert-list-style">{children}</li>
          ),
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match?.[1];

            return !inline && match ? (
              <MdCode lang={lang} {...props}>
                {children}
              </MdCode>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
