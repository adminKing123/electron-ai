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
    <button onClick={handleClick} className="flex items-center gap-[5px] text-white">
      {copied ? (
        <>
          <MdOutlineDone />
          Copied
        </>
      ) : (
        <>
          <LuCopy />
          Copy
        </>
      )}
    </button>
  );
};

export default MdCodeCopyButton;
