import { IoClose } from "react-icons/io5";
import usePromptStore from "../../store/usePromptStores";
import { focusPromptTextArea } from "../../utils/helpers";

const MessageBeingEdited = ({ action }) => {
  const setAction = usePromptStore((state) => state.setAction);

  const handleCancel = () => {
    setAction({});
    focusPromptTextArea();
  };

  return (
    <div className="flex items-center gap-2 font-sans p-2 mb-2 text-black dark:text-white bg-[#444444] rounded-xl">
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
