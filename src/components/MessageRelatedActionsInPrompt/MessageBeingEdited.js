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
      className="flex items-center gap-2 px-4 py-2 mx-1 mt-1
        text-[#555] dark:text-[#888]
        bg-[#f5f5f5] dark:bg-[#2a2a2a]
        rounded-t-[20px] rounded-b-md
        border-b border-[#e8e8e8] dark:border-[#333]
        cursor-pointer
        hover:bg-[#f0f0f0] dark:hover:bg-[#2e2e2e]
        transition-colors"
    >
      <FiEdit2 className="w-[11px] h-[11px] flex-shrink-0 opacity-60" />
      <div className="line-clamp-1 text-[12px] flex-grow leading-snug">
        {action.data.prompt}
      </div>
      <button
        onClick={handleCancel}
        className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0
          hover:bg-[#e4e4e4] dark:hover:bg-[#3a3a3a]
          hover:text-[#111] dark:hover:text-white
          transition-colors"
      >
        <IoClose className="w-[12px] h-[12px]" />
      </button>
    </div>
  );
};

export default MessageBeingEdited;
