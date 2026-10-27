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
        text-ink-650 dark:text-ink-500
        bg-ink-50 dark:bg-ink-800
        rounded-t-[20px] rounded-b-md
        border-b border-ink-100 dark:border-ink-750
        cursor-pointer
        hover:bg-ink-75 dark:hover:bg-ink-775
        transition-colors"
    >
      <FiEdit2 className="w-[11px] h-[11px] flex-shrink-0 opacity-60" />
      <div className="line-clamp-1 text-[12px] flex-grow leading-snug">
        {action.data.prompt}
      </div>
      <button
        onClick={handleCancel}
        className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0
          hover:bg-ink-150 dark:hover:bg-ink-725
          hover:text-ink-975 dark:hover:text-white
          transition-colors"
      >
        <IoClose className="w-[12px] h-[12px]" />
      </button>
    </div>
  );
};

export default MessageBeingEdited;
