import { useState } from "react";
import { IoCopy } from "react-icons/io5";
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
      className="p-[6px] hover:bg-[#E8E8E8] dark:hover:bg-[#1d1d1d] rounded-md"
    >
      {copied ? <MdDone /> : <IoCopy />}
    </button>
  );
};

export default CopyMessagePrompt;
