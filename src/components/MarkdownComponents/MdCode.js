import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark as codeDarkTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import MdCodeCopyButton from "./MdCodeCopyButton";

const MdCode = ({ lang, children, ...props }) => {
  const handleCopy = async (callback) => {
    try {
      await navigator.clipboard.writeText(children);
      callback?.();
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="my-4 bg-[#2B2B2B] border border-[#454545] rounded-2xl">
      <div className="px-[18px] py-2 bg-[#3e3e3e] rounded-t-2xl flex justify-between items-center">
        <div className="font-bold text-white">{lang}</div>
        <MdCodeCopyButton handleCopy={handleCopy} />
      </div>
      <div className="px-1 pb-1">
        <SyntaxHighlighter
          style={codeDarkTheme}
          language={lang}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default MdCode;
