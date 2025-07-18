import { FiEdit2 } from "react-icons/fi";

const EditMessagePrompt = ({ handleEdit }) => {
  return (
    <button
      onClick={handleEdit}
      className="p-[6px] hover:bg-[#E8E8E8] dark:hover:bg-[#1d1d1d] rounded-md"
    >
      <FiEdit2 />
    </button>
  );
};

export default EditMessagePrompt;
