import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useModelStore, useWebSearchStore } from "../store/usePromptStores";
import { GoDependabot } from "react-icons/go";
import { GiMusicalNotes } from "react-icons/gi";
import { RiMagicLine } from "react-icons/ri";

import { IoCodeSlash } from "react-icons/io5";
import { IoInformationCircleOutline } from "react-icons/io5";

import { MdWorkOutline } from "react-icons/md";
import { SiTicktick } from "react-icons/si";
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
  const setDefaultAIType = useModelStore((state) => state.setDefaultAIType);
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
          className="flex items-center gap-2 px-3 rounded-xl py-2 text-[#4d4d4d] dark:text-[#c0c0c0] text-xs"
        >
          <span>
            <SelectedIcon />
          </span>
          <span>{selectedType?.name}</span>
          <span className="ml-2" title={selectedType?.description}>
            <IoInformationCircleOutline className="text-base" />
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content className="p-2 shadow-xl rounded-xl z-10 border border-[#E1E1E1] dark:border-[#2F2F2F] bg-[#ffffff] dark:bg-[#2F2F2F]">
        {AI_TYPES.map((type) => {
          const Icon = get_ai_icon(type.id);
          const isSelected = selectedType?.id === type.id;
          return (
            <DropdownMenu.Item
              key={type.id}
              onSelect={() => handleSelect(type)}
              className="flex text-[#000000] dark:text-[#C8C8C8] items-center gap-5 w-full hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3A] rounded-lg px-2 py-2 text-[14px] outline-none cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-grow">
                <Icon className="text-xl" />
                <div>
                  <span className="text-xs text-nowrap">{type.name}</span>
                  <p className="text-[10px] text-nowrap">{type.description}</p>
                </div>
              </div>
              {isSelected ? (
                <SiTicktick className="w-3 h-3 fill-[#000000] dark:fill-[#C8C8C8]" />
              ) : null}
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default AITypeSelector;
