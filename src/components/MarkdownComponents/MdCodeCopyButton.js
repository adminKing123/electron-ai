import { useState } from "react";
import { LuCopy } from "react-icons/lu";
import { MdOutlineDone } from "react-icons/md";

const MdCodeCopyButton = ({ handleCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (!copied) {
      handleCopy(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md
        text-[11px] font-medium
        text-[#888] dark:text-[#555]
        hover:text-[#333] dark:hover:text-white
        hover:bg-[#e4e4e4] dark:hover:bg-[#2a2a2a]
        transition-colors"
    >
      {copied ? (
        <>
          <MdOutlineDone className="w-[12px] h-[12px]" />
          Copied
        </>
      ) : (
        <>
          <LuCopy className="w-[12px] h-[12px]" />
          Copy
        </>
      )}
    </button>
  );
};

export default MdCodeCopyButton;
