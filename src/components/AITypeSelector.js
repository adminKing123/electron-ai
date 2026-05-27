import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useModelStore, useWebSearchStore } from "../store/usePromptStores";
import { GoDependabot } from "react-icons/go";
import { GiMusicalNotes } from "react-icons/gi";
import { RiMagicLine } from "react-icons/ri";
import { IoCodeSlash, IoCheckmark, IoChevronDown } from "react-icons/io5";
import { MdWorkOutline } from "react-icons/md";
import { useEffect } from "react";

const AI_ICONS = {
  TEXT: GoDependabot,
  CODE: IoCodeSlash,
  ARHYTHM_ASSISTANT: GiMusicalNotes,
  HRMS_ASSISTANT_1_0: MdWorkOutline,
  MEDIA_GENERATOR: RiMagicLine,
};

const get_ai_icon = (type_id) => AI_ICONS?.[type_id] || GoDependabot;

function AITypeSelector() {
  const AI_TYPES = useModelStore((state) => state.AI_TYPES);
  const AI_MODELS = useModelStore((state) => state.AI_MODELS);
  const setModel = useModelStore((state) => state.setModel);
  const selectedType = useModelStore((state) => state.type);
  const defaultAIType = useModelStore((state) => state.defaultAIType);
  const setIsWebSearchDisabled = useWebSearchStore(
    (state) => state.setIsWebSearchDisabled,
  );
  const setType = useModelStore((state) => state.setType);

  const SelectedIcon = get_ai_icon(selectedType?.id);

  const handleSelect = (type) => {
    const model_selected = AI_MODELS[type.id].default_model;
    setType(type);
    setModel(model_selected);
    setIsWebSearchDisabled(model_selected.google_search === false);
  };

  useEffect(() => {
    if (!selectedType && defaultAIType) {
      setType(defaultAIType);
      setModel(AI_MODELS[defaultAIType.id].default_model);
    }
  }, [selectedType, defaultAIType]);

  if (!selectedType) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          id="ai-type-toggler"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-[#f4f4f4] dark:bg-[#3a3a3a]
            hover:bg-[#e9e9e9] dark:hover:bg-[#444444]
            text-[#333] dark:text-[#ccc]
            text-[13px] font-medium
            transition-colors outline-none select-none"
        >
          <SelectedIcon className="w-[15px] h-[15px] flex-shrink-0" />
          <span className="hidden sm:inline">{selectedType?.name}</span>
          <IoChevronDown className="w-[13px] h-[13px] opacity-50" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="p-1.5 rounded-2xl z-50
            border border-[#e5e5e5] dark:border-[#3a3a3a]
            bg-white dark:bg-[#2a2a2a]
            shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]
            min-w-[220px]"
        >
          {AI_TYPES.map((type) => {
            const Icon = get_ai_icon(type.id);
            const isSelected = selectedType?.id === type.id;
            return (
              <DropdownMenu.Item
                key={type.id}
                onSelect={() => handleSelect(type)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-[#333] dark:text-[#ccc]
                  hover:bg-[#f4f4f4] dark:hover:bg-[#363636]
                  outline-none cursor-pointer transition-colors"
              >
                <Icon className="w-[16px] h-[16px] flex-shrink-0 opacity-75" />
                <div className="flex flex-col flex-grow min-w-0">
                  <span className="text-[13px] font-medium leading-tight">{type.name}</span>
                  {type.description ? (
                    <span className="text-[11px] text-[#999] dark:text-[#666] leading-tight mt-0.5 truncate">
                      {type.description}
                    </span>
                  ) : null}
                </div>
                {isSelected && (
                  <IoCheckmark className="w-[14px] h-[14px] flex-shrink-0 text-[#111] dark:text-white" />
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default AITypeSelector;
