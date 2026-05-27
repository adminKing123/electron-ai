import { AiOutlineDelete } from "react-icons/ai";
import useMessageStore from "../../../store/useMessagesStore";

const DeleteMessageButton = ({ id, chat }) => {
  const deleteMessage = useMessageStore(state => state.deleteMessage);
  
  const handleClickDelete = () => {
    deleteMessage(id, chat.id);
  };

  return (
    <button
      onClick={handleClickDelete}
      title="Delete message"
      className="w-7 h-7 flex items-center justify-center rounded-lg
        text-[#888] dark:text-[#888]
        hover:text-red-500 dark:hover:text-red-400
        hover:bg-[#ebebeb] dark:hover:bg-[#222]
        transition-colors"
    >
      <AiOutlineDelete className="w-[14px] h-[14px]" />
    </button>
  );
};

export default DeleteMessageButton;
