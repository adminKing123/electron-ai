import { HiArrowDown } from "react-icons/hi";

const ScrollToBottomButton = () => {
  const handleClick = () => {
    const container = document.getElementById("messages-container");
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      id="scroll-to-top"
      onClick={handleClick}
      className="flex items-center justify-center w-8 h-8 rounded-full
        bg-white dark:bg-[#1e1e1e]
        border border-[#e5e5e5] dark:border-[#2a2a2a]
        shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]
        text-[#888] dark:text-[#666]
        hover:text-[#111] dark:hover:text-white
        transition-colors
        absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden"
    >
      <HiArrowDown className="w-[14px] h-[14px]" />
    </button>
  );
};

export default ScrollToBottomButton;
