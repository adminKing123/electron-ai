import { MdDelete } from "react-icons/md";
import useMessageStore from "../../../store/useMessagesStore";

const DeleteMessageButton = ({ id, chat_id }) => {
  const { deleteMessage } = useMessageStore();
  const handleClickDelete = () => {
    deleteMessage(id, chat_id);
  };

  return (
    <button
      onClick={handleClickDelete}
      className="p-[6px] hover:bg-[#1d1d1d] rounded-md"
    >
      <MdDelete />
    </button>
  );
};

export default DeleteMessageButton;
