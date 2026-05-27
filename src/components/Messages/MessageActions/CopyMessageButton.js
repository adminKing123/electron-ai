import { useState } from "react";
import { LuCopy } from "react-icons/lu";
import { MdDone } from "react-icons/md";

const CopyButton = ({ handleCopy }) => {
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
      title={copied ? "Copied!" : "Copy"}
      className="w-7 h-7 flex items-center justify-center rounded-lg
        text-[#888] dark:text-[#888]
        hover:text-[#111] dark:hover:text-white
        hover:bg-[#ebebeb] dark:hover:bg-[#222]
        transition-colors"
    >
      {copied ? <MdDone className="w-[14px] h-[14px]" /> : <LuCopy className="w-[14px] h-[14px]" />}
    </button>
  );
};

export default CopyButton;
