import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import MdCodeCopyButton from "./MdCodeCopyButton";
import MdSvgRenderer from "./MdSvgRenderer";
import { detectRenderableContent } from "../../utils/helpers";
import MdTableViewRenderer from "./MdTableViewRenderer";
import MdWebCodeViewRenderer from "./MdWebCodeView";

const MdCode = ({ lang = "", message_id = "", children, ...props }) => {
  const handleCopy = async (callback) => {
    try {
      await navigator.clipboard.writeText(children);
      callback?.();
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const content = String(children).replace(/\n$/, "");
  const renderType = detectRenderableContent(lang, content);
  const displayLang = renderType || lang;

  const renderContent = () => {
    if (renderType === "svg")
      return (
        <div className="p-4">
          <MdSvgRenderer content={content} />
        </div>
      );
    else if (renderType === "tableview")
      return <MdTableViewRenderer content={content} message_id={message_id} />;
    else if (renderType === "htmlview")
      return <MdWebCodeViewRenderer content={content} message_id={message_id} />;
    else
      return (
        <div>
          <SyntaxHighlighter
            language={lang}
            useInlineStyles={false}
            style={{}}
            customStyle={{ margin: 0, padding: "16px" }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      );
  };

  if (renderType === "tableview" || renderType === "htmlview") return renderContent();
  else
    return (
      <div className="my-4 bg-ink-25 dark:bg-void-850 border border-ink-100 dark:border-void-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 bg-ink-75 dark:bg-void-825 border-b border-ink-100 dark:border-void-800 flex justify-between items-center">
          <span className="text-[12px] font-medium text-ink-500 dark:text-ink-550 tracking-wide">
            {displayLang}
          </span>
          <MdCodeCopyButton handleCopy={handleCopy} />
        </div>
        {renderContent()}
      </div>
    );
};

export default MdCode;
