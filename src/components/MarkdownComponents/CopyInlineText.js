import { useState } from "react";
import { LuCopy } from "react-icons/lu";
import { MdDone } from "react-icons/md";
import { copyText } from "../../utils/helpers";

const MdCopyInlineText = ({ children }) => {
  const [copied, setCopied] = useState(false);

  const text = String(children).trim();

  const handleCopy = () => {
    if (copied) return;
    copyText(text, () => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 800);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="px-2 py-1 text-xs inline-flex items-center border border-[#eaeaea] dark:border-[#414141] bg-[#EAEAEA] dark:bg-[#232323] hover:bg-[#EFEFEF] dark:hover:bg-[#252525] active:bg-[#dbdbdb] dark:active:bg-[#1f1f1f] rounded-full"
    >
      <div className="max-w-[100px] truncate">
        <span className="">{text}</span>
      </div>
      {copied ? <MdDone /> : <LuCopy />}
    </button>
  );
};

export default MdCopyInlineText;
