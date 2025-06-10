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
      className="p-[6px] hover:bg-[#E8E8E8] dark:hover:bg-[#1d1d1d] rounded-md"
    >
      {copied ? <MdDone /> : <LuCopy />}
    </button>
  );
};

export default CopyButton;
