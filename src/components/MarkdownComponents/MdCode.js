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
        <div className="p-4">
          <SyntaxHighlighter
            language={lang}
            useInlineStyles={false}
            style={{}}
            customStyle={{ margin: 0 }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      );
  };

  if (renderType === "tableview" || renderType === "htmlview") return renderContent();
  else
    return (
      <div className="my-4 bg-[#F9F9F9] dark:bg-[#171717] border border-[#E4E4E4] dark:border-[#454545] rounded-2xl overflow-hidden">
        <div className="px-[18px] py-2 bg-[#f1f1f1] dark:bg-[#1d1d1d] rounded-t-2xl flex justify-between items-center">
          <div className="font-bold text-black dark:text-white">
            {displayLang}
          </div>
          <MdCodeCopyButton handleCopy={handleCopy} />
        </div>
        {renderContent()}
      </div>
    );
};

export default MdCode;
