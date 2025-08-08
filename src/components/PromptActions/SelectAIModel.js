import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useGetAIModelsAPI } from "../../apis/ai_models/queryHooks";
import { SiTicktick } from "react-icons/si";
import { useModelStore, useWebSearchStore } from "../../store/usePromptStores";
import { BsCpu } from "react-icons/bs";
import { RiGeminiFill, RiClaudeFill } from "react-icons/ri";
import { TbGalaxy } from "react-icons/tb";

const AI_ICONS = {
  GEMINI: RiGeminiFill,
  CLAUDE: RiClaudeFill,
  NONEY: TbGalaxy,
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

  const model_selected = selectedModel || data?.default_model;
  const isDisabled = disabled || isLoading || isError || !data?.models?.length;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild disabled={isDisabled}>
        <button
          title={selectedModel?.name}
          className="border dark:border-[#FAFAFA] bg-[#ffffff] disabled:opacity-50 p-2 rounded-full flex items-center group"
        >
          <BsCpu />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="p-2 max-h-[240px] overflow-auto min-w-[240px] w-fit rounded-xl border border-[#E1E1E1] dark:border-[#444444] bg-[#FFFFFF] dark:bg-[#2F2F2F] cursor-pointer z-10"
          sideOffset={5}
        >
          {data?.models?.map((model) => {
            const Icon = AI_ICONS[model.from];
            const isSelected = model_selected?.id === model.id;

            return (
              <DropdownMenu.Item
                key={model.id}
                onSelect={() => onSelect(model)}
                className={`px-3 py-2 text-sm rounded-xl max-w-[240px] truncate outline-none ${
                  isSelected
                    ? "text-blue-500 dark:text-green-500"
                    : "text-[#000000] dark:text-[#ffffff] hover:bg-[#F5F5F5] dark:hover:bg-[#444444]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 truncate">
                    <Icon />
                    <span className="truncate">{model.name}</span>
                  </div>
                  {isSelected && (
                    <SiTicktick className="w-3 h-3 fill-blue-500 dark:fill-green-500" />
                  )}
                </div>
                <p className="text-[#ccc] text-[12px]">{model?.description}</p>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SelectAIModel;
