import { FiEdit2 } from "react-icons/fi";

const EditMessagePrompt = ({ handleEdit }) => {
  return (
    <button
      onClick={handleEdit}
      title="Edit prompt"
      className="w-7 h-7 flex items-center justify-center rounded-lg
        text-ink-500 dark:text-ink-500
        hover:text-ink-975 dark:hover:text-white
        hover:bg-ink-100 dark:hover:bg-void-875
        transition-colors"
    >
      <FiEdit2 className="w-[13px] h-[13px]" />
    </button>
  );
};

export default EditMessagePrompt;
