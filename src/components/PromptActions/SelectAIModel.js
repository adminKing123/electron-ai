import { FaBrain } from "react-icons/fa";
import { useGetAIModels } from "../../apis/ai_models/queryHooks";
import { useState } from "react";
import { SiTicktick } from "react-icons/si";

const SelectAIModel = ({
  disabled,
  onSelect,
  selectedModel,
  toggleWebSearchDisabled,
}) => {
  const { data, isLoading, isError } = useGetAIModels({
    onSuccess: (response) => {
      if (!selectedModel) {
        toggleWebSearchDisabled(
          response?.default_model.google_search === false
        );
      }
    },
  });
  const model_selected = selectedModel ? selectedModel : data?.default_model;
  const isDisabled =
    disabled ||
    isLoading ||
    isError ||
    (data.models && data.models?.length === 0);

  const [isOpen, setOpen] = useState(true);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleSelect = (value) => {
    onSelect?.(value);
  };

  return (
    <div className="relative">
      {isOpen && !isDisabled ? (
        <div className="absolute p-2 bottom-full mb-1 max-h-[240px] w-fit max-w-[180px] rounded-3xl border border-[#1c1e21] bg-[#151515] cursor-pointer">
          {data.models.map((model) => {
            const isSelected = model_selected?.id === model.id;
            return (
              <div
                key={model.id}
                onClick={() => handleSelect(model)}
                className={`px-4 py-2 text-xs truncate rounded-3xl flex items-center justify-between gap-2 ${
                  isSelected
                    ? "text-green-500"
                    : "text-[#828282] hover:bg-[#1c1e21]"
                }`}
              >
                <div className="truncate">{model.name}</div>
                <div className="w-3 h-3">
                  {isSelected ? (
                    <SiTicktick className="fill-green-500" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      <button
        disabled={isDisabled}
        onClick={handleToggle}
        className="bg-[#ffffff] hover:bg-[#C1C1C1] disabled:opacity-50 p-2 rounded-full"
      >
        <FaBrain />
      </button>
    </div>
  );
};

export default SelectAIModel;
