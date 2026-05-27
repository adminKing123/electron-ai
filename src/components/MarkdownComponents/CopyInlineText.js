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
      className="px-2 py-1 text-[11px] inline-flex items-center gap-1
        border border-[#e5e5e5] dark:border-[#2e2e2e]
        bg-[#f0f0f0] dark:bg-[#252525]
        hover:bg-[#e8e8e8] dark:hover:bg-[#2a2a2a]
        active:bg-[#e0e0e0] dark:active:bg-[#222]
        rounded-full
        text-[#555] dark:text-[#aaa]
        transition-colors"
    >
      <span className="max-w-[100px] truncate">{text}</span>
      {copied
        ? <MdDone className="w-[12px] h-[12px] flex-shrink-0 text-green-500" />
        : <LuCopy className="w-[11px] h-[11px] flex-shrink-0" />}
    </button>
  );
};

export default MdCopyInlineText;
