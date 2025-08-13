import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import MdCode from "./MarkdownComponents/MdCode";
import MdImage from "./MarkdownComponents/MdImage";
import MdChart from "./MarkdownComponents/MdChart";

const MarkdownRenderer = ({ message_id, content }) => {
  const components = useMemo(
    () => ({
      chartdata: ({ node, ...props }) => <MdChart message_id={message_id} {...props} />,
      img: ({ node, ...props }) => <MdImage {...props} />,
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
    }),
    [message_id]
  );
  return (
    <div className="markdown-body">
      <ReactMarkdown
        rehypePlugins={[remarkRaw, rehypeKatex]}
        remarkPlugins={[remarkGfm, remarkMath]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
