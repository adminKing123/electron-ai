import { IoClose } from "react-icons/io5";
import usePromptStore from "../../store/usePromptStores";
import { focusPromptTextArea, scrollToMessageTop } from "../../utils/helpers";

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
      className="flex items-center gap-2 font-sans p-2 mb-2 text-black dark:text-white bg-[#f0f0f0] dark:bg-[#444444] rounded-xl cursor-pointer"
    >
      <div className="line-clamp-2 text-[11px] flex-grow">
        {action.data.prompt}
      </div>
      <button onClick={handleCancel} className="p-[6px] rounded-md">
        <IoClose />
      </button>
    </div>
  );
};

export default MessageBeingEdited;
