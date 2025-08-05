import { IoClose } from "react-icons/io5";
import usePromptStore from "../../store/usePromptStores";
import { focusPromptTextArea, scrollToMessageTop } from "../../utils/helpers";
import { FiEdit2 } from "react-icons/fi";

const MessageBeingEdited = ({ action }) => {
  const setAction = usePromptStore((state) => state.setAction);

  const handleCancel = (e) => {
    e?.stopPropagation();
    setAction({});
    focusPromptTextArea();
  };

  const handleClick = (e) => {
    e?.stopPropagation();
    scrollToMessageTop(action.data.message_id);
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-2 font-sans px-5 py-2 mx-1 mt-1 text-black dark:text-white bg-[#f0f0f0] dark:bg-[#444444] rounded-t-[18px] rounded-b-lg cursor-pointer active:bg-[#e0e0e0] dark:active:bg-[#3a3a3a]"
    >
      <FiEdit2 className="text-[11px] flex-shrink-0" />
      <div className="line-clamp-2 text-[11px] flex-grow">
        {action.data.prompt}
      </div>
      <button
        onClick={handleCancel}
        className="p-[6px] hover:bg-[#EAEAEA] dark:hover:bg-[#3A3A3A] rounded-lg"
      >
        <IoClose />
      </button>
    </div>
  );
};

export default MessageBeingEdited;
