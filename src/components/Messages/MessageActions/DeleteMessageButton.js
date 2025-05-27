import { MdDelete } from "react-icons/md";
import useMessageStore from "../../../store/useMessagesStore";

const DeleteMessageButton = ({ id, chat }) => {
  const { deleteMessage } = useMessageStore();
  const handleClickDelete = () => {
    deleteMessage(id, chat.id);
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
