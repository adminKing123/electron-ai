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
        bg-white dark:bg-void-825
        border border-ink-150 dark:border-void-800
        shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]
        text-ink-500 dark:text-ink-500
        hover:text-ink-975 dark:hover:text-white
        transition-colors
        absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden"
    >
      <HiArrowDown className="w-[14px] h-[14px]" />
    </button>
  );
};

export default ScrollToBottomButton;
