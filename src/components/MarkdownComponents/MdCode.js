import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import MdCodeCopyButton from "./MdCodeCopyButton";

const MdCode = ({ lang = "", children, ...props }) => {
  const handleCopy = async (callback) => {
    try {
      await navigator.clipboard.writeText(children);
      callback?.();
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="my-4 bg-[#F9F9F9] dark:bg-[#171717] border border-[#E4E4E4] dark:border-[#454545] rounded-2xl overflow-hidden">
      <div className="px-[18px] py-2 bg-[#f1f1f1] dark:bg-[#2F2F2F] rounded-t-2xl flex justify-between items-center">
        <div className="font-bold text-black dark:text-white">{lang}</div>
        <MdCodeCopyButton handleCopy={handleCopy} />
      </div>
      <div className="p-4">
        <SyntaxHighlighter
          language={lang}
          useInlineStyles={false}
          style={{}}
          customStyle={{ margin: 0 }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default MdCode;
