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
      className="border text-black dark:text-white border-[#E1E1E1] dark:border-[#424242] bg-[#ffffff] dark:bg-[#212121] p-2 rounded-full absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden"
    >
      <HiArrowDown />
    </button>
  );
};

export default ScrollToBottomButton;
