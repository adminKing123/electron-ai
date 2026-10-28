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
        border border-ink-150 dark:border-void-775
        bg-ink-75 dark:bg-void-825
        hover:bg-ink-100 dark:hover:bg-void-800
        active:bg-ink-150 dark:active:bg-void-875
        rounded-full
        text-ink-650 dark:text-ink-400
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
