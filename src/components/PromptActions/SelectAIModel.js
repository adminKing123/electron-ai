import { FaBrain } from "react-icons/fa";
import { useGetAIModels } from "../../apis/ai_models/queryHooks";

const SelectAIModel = ({ disabled, onSelect }) => {
  const { data, isLoading, isError } = useGetAIModels();
  const isDisabled =
    disabled ||
    isLoading ||
    isError ||
    (data.models && data.models?.length === 0);

  return (
    <div>
      <button
        disabled={isDisabled}
        className="bg-[#ffffff] hover:bg-[#C1C1C1] disabled:opacity-50 p-2 rounded-full"
      >
        <FaBrain />
      </button>
    </div>
  );
};

export default SelectAIModel;
