import { useGetAIModelsAPI } from "../../apis/ai_models/queryHooks";
import { useState, useRef, useEffect } from "react";
import { SiTicktick } from "react-icons/si";
import { useModelStore, useWebSearchStore } from "../../store/usePromptStores";
import { BsCpu } from "react-icons/bs";


import { RiGeminiFill } from "react-icons/ri";
import { RiClaudeFill } from "react-icons/ri";

const AI_ICONS = {
  GEMINI: RiGeminiFill,
  CLAUDE: RiClaudeFill,
};

const AIModel = ({ model, handleSelect, isSelected }) => {
  const Icon = AI_ICONS[model.from];

  return (
    <div
      key={model.id}
      onClick={() => handleSelect(model)}
      className={`px-3 py-2 text-sm rounded-xl max-w-[240px] truncate ${
        isSelected
          ? "text-blue-500 dark:text-green-500"
          : "text-[#000000] dark:text-[#ffffff] hover:bg-[#F5F5F5] dark:hover:bg-[#444444]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 truncate">
          <span>
            <Icon />
          </span>
          <span className="truncate">{model.name}</span>
        </div>
        <div className="w-3 h-3">
          {isSelected && (
            <SiTicktick className="fill-blue-500 dark:fill-green-500" />
          )}
        </div>
      </div>
      <p className="text-[#ccc] text-[12px]">{model?.description}</p>
    </div>
  );
};

const SelectAIModel = ({ disabled }) => {
  const selectedModel = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const setIsWebSearchDisabled = useWebSearchStore(
    (state) => state.setIsWebSearchDisabled
  );

  const onSelect = (model_selected) => {
    setModel(model_selected);
    setIsWebSearchDisabled(model_selected.google_search === false);
  };

  const { data, isLoading, isError } = useGetAIModelsAPI({
    onSuccess: (response) => {
      if (!selectedModel) {
        setIsWebSearchDisabled(response?.default_model.google_search === false);
        onSelect(response?.default_model);
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
        <div className="absolute p-2 bottom-full mb-1 max-h-[240px] overflow-auto min-w-[240px] w-fit rounded-xl border border-[#E1E1E1] dark:border-[#444444] bg-[#FFFFFF] dark:bg-[#2F2F2F] cursor-pointer z-10">
          {data.models.map((model) => {
            const isSelected = model_selected?.id === model.id;
            return (
              <AIModel
                model={model}
                handleSelect={handleSelect}
                isSelected={isSelected}
              />
            );
          })}
        </div>
      )}
      <button
        title={selectedModel?.name}
        disabled={isDisabled}
        onClick={handleToggle}
        className="border dark:border-[#FAFAFA] bg-[#ffffff] disabled:opacity-50 p-2 rounded-full flex items-center group"
      >
        <BsCpu />
      </button>
    </div>
  );
};

export default SelectAIModel;
