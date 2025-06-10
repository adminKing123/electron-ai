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
      className="p-[6px] hover:bg-[#E8E8E8] dark:hover:bg-[#1d1d1d] rounded-md"
    >
      <AiOutlineDelete />
    </button>
  );
};

export default DeleteMessageButton;
