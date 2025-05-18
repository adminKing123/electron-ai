import { IoArrowUp, IoStop } from "react-icons/io5";

const SendButton = ({
  onClick,
  stopGeneration,
  disabled,
  isGeneratingPrompt,
}) => {
  if (isGeneratingPrompt)
    return (
      <button
        onClick={stopGeneration}
        className="bg-[#ffffff] hover:bg-[#C1C1C1] disabled:opacity-50 p-2 rounded-full"
      >
        <IoStop />
      </button>
    );
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-[#ffffff] hover:bg-[#C1C1C1] disabled:opacity-50 p-2 rounded-full"
    >
      <IoArrowUp />
    </button>
  );
};

export default SendButton;
