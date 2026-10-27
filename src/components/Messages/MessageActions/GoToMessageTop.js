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
        text-ink-500 dark:text-ink-500
        hover:text-ink-975 dark:hover:text-white
        hover:bg-ink-100 dark:hover:bg-ink-875
        transition-colors"
    >
      <FiCornerRightUp className="w-[14px] h-[14px]" />
    </button>
  );
};

export default GoToMessageTop;
