import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MdImage = ({ src, alt }) => {
  return (
    <div className="max-w-[400px] rounded-lg overflow-hidden">
      <img src={src} alt={alt} className="h-full" loading="lazy" />
    </div>
  );
};

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ node, ...props }) => <MdImage {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
