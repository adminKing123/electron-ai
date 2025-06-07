import { FiCornerRightUp } from "react-icons/fi";
import { scrollToMessageTop } from "../../../utils/helpers";

const GoToMessageTop = ({ id }) => {
  const handleClick = () => {
    scrollToMessageTop(id);
  };

  return (
    <button
      onClick={handleClick}
      className="p-[6px] hover:bg-[#E8E8E8] dark:hover:bg-[#1d1d1d] rounded-md"
    >
      <FiCornerRightUp />
    </button>
  );
};

export default GoToMessageTop;
