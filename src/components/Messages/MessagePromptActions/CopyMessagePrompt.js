import { useState } from "react";
import { LuCopy } from "react-icons/lu";
import { MdDone } from "react-icons/md";

const CopyMessagePrompt = ({ handleCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleClickCopy = () => {
    if (copied) return;
    handleCopy?.(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 800);
    });
  };

  return (
    <button
      onClick={handleClickCopy}
      title={copied ? "Copied!" : "Copy prompt"}
      className="w-7 h-7 flex items-center justify-center rounded-lg
        text-[#888] dark:text-[#666]
        hover:text-[#111] dark:hover:text-white
        hover:bg-[#ebebeb] dark:hover:bg-[#222]
        transition-colors"
    >
      {copied ? <MdDone className="w-[13px] h-[13px]" /> : <LuCopy className="w-[13px] h-[13px]" />}
    </button>
  );
};

export default CopyMessagePrompt;
