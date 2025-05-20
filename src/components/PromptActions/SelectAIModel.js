import { FaBrain } from "react-icons/fa";
import { useGetAIModelsAPI } from "../../apis/ai_models/queryHooks";
import { useState, useRef, useEffect } from "react";
import { SiTicktick } from "react-icons/si";

const SelectAIModel = ({
  disabled,
  onSelect,
  selectedModel,
  toggleWebSearchDisabled,
}) => {
  const { data, isLoading, isError } = useGetAIModelsAPI({
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

  const [isOpen, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleSelect = (value) => {
    onSelect?.(value);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {isOpen && !isDisabled && (
        <div className="absolute p-2 bottom-full mb-1 max-h-[240px] w-fit max-w-[180px] rounded-3xl border border-[#1c1e21] bg-[#151515] cursor-pointer z-10">
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
                  {isSelected && <SiTicktick className="fill-green-500" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <button
        title={selectedModel?.name}
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
