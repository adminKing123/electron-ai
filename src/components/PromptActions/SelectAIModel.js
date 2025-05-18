import { FaBrain } from "react-icons/fa";

const SelectAIModel = ({ disabled }) => {
  return (
    <div>
      <button
        disabled={disabled}
        className="bg-[#ffffff] hover:bg-[#C1C1C1] disabled:opacity-50 p-2 rounded-full"
      >
        <FaBrain />
      </button>
    </div>
  );
};

export default SelectAIModel;
