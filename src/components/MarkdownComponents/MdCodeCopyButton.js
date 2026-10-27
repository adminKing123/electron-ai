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
        text-ink-500 dark:text-ink-550
        hover:text-ink-750 dark:hover:text-white
        hover:bg-ink-150 dark:hover:bg-ink-800
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
