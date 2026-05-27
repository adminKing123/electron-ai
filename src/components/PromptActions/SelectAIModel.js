import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { IoCheckmark, IoChevronDown } from "react-icons/io5";
import { useModelStore, useWebSearchStore } from "../../store/usePromptStores";
import { RiGeminiFill, RiClaudeFill } from "react-icons/ri";
import { TbGalaxy } from "react-icons/tb";

const AI_ICONS = {
  GEMINI: RiGeminiFill,
  CLAUDE: RiClaudeFill,
  NONEY: TbGalaxy,
};

const SelectAIModel = ({ disabled }) => {
  const AI_MODELS = useModelStore((state) => state.AI_MODELS);
  const selectedModel = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const setIsWebSearchDisabled = useWebSearchStore(
    (state) => state.setIsWebSearchDisabled
  );

  const onSelect = (model_selected) => {
    setModel(model_selected);
    setIsWebSearchDisabled(model_selected.google_search === false);
  };

  const type = useModelStore((state) => state.type);
  const data = AI_MODELS[type?.id] || null;
  const model_selected = selectedModel || data?.default_model;
  const isDisabled = disabled || !data?.models?.length;
  const TriggerIcon = AI_ICONS[model_selected?.from] || TbGalaxy;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild disabled={isDisabled}>
        <button
          title={model_selected?.name}
          className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 rounded-full
            bg-[#f4f4f4] dark:bg-[#3a3a3a]
            hover:bg-[#e9e9e9] dark:hover:bg-[#444444]
            disabled:opacity-40 disabled:cursor-not-allowed
            text-[13px] font-medium text-black dark:text-white
            transition-colors duration-150 outline-none"
        >
          <TriggerIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
          <span className="hidden sm:inline truncate max-w-[120px]">
            {model_selected?.name || "Select model"}
          </span>
          <IoChevronDown className="hidden sm:block w-3 h-3 flex-shrink-0 opacity-50" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="p-1.5 max-h-[260px] overflow-auto min-w-[220px] rounded-2xl
            border border-[#e5e5e5] dark:border-[#3a3a3a]
            bg-white dark:bg-[#2a2a2a]
            shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]
            z-10"
          sideOffset={8}
        >
          {data?.models?.map((model) => {
            const Icon = AI_ICONS[model.from] || TbGalaxy;
            const isSelected = model_selected?.id === model.id;

            return (
              <DropdownMenu.Item
                key={model.id}
                onSelect={() => onSelect(model)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl outline-none cursor-pointer
                  text-[#111] dark:text-[#f0f0f0]
                  hover:bg-[#f4f4f4] dark:hover:bg-[#363636]
                  transition-colors duration-100"
              >
                <Icon className="w-4 h-4 flex-shrink-0 opacity-60" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{model.name}</p>
                  {model?.description && (
                    <p className="text-[11px] text-[#888] dark:text-[#666] truncate mt-0.5">
                      {model.description}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <IoCheckmark className="w-4 h-4 flex-shrink-0 text-[#111] dark:text-[#f0f0f0] opacity-80" />
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SelectAIModel;

