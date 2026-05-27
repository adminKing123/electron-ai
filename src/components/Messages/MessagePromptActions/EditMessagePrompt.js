import { FiEdit2 } from "react-icons/fi";

const EditMessagePrompt = ({ handleEdit }) => {
  return (
    <button
      onClick={handleEdit}
      title="Edit prompt"
      className="w-7 h-7 flex items-center justify-center rounded-lg
        text-[#888] dark:text-[#666]
        hover:text-[#111] dark:hover:text-white
        hover:bg-[#ebebeb] dark:hover:bg-[#222]
        transition-colors"
    >
      <FiEdit2 className="w-[13px] h-[13px]" />
    </button>
  );
};

export default EditMessagePrompt;
