import { HiArrowDown } from "react-icons/hi";

const ScrollToBottomButton = () => {
  const handleClick = () => {
    const container = document.getElementById("messages-container");
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
      });
    }
  };

  return (
    <button
      id="scroll-to-top"
      onClick={handleClick}
      className="border dark:text-white dark:border-[#424242] dark:bg-[#212121] p-2 rounded-full absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden"
    >
      <HiArrowDown />
    </button>
  );
};

export default ScrollToBottomButton;
