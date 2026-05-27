import { FiCornerRightUp } from "react-icons/fi";
import { scrollToMessageTop } from "../../../utils/helpers";

const GoToMessageTop = ({ id }) => {
  const handleClick = () => {
    scrollToMessageTop(id);
  };

  return (
    <button
      onClick={handleClick}
      title="Scroll to top of message"
      className="w-7 h-7 flex items-center justify-center rounded-lg
        text-[#888] dark:text-[#888]
        hover:text-[#111] dark:hover:text-white
        hover:bg-[#ebebeb] dark:hover:bg-[#222]
        transition-colors"
    >
      <FiCornerRightUp className="w-[14px] h-[14px]" />
    </button>
  );
};

export default GoToMessageTop;
