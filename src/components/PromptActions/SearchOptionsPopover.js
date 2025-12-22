import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MdTune } from "react-icons/md";
import { useWebSearchStore, useDeepResearchStore } from "../../store/usePromptStores";
import WebSearchOption from "./WebSearchOption";
import DeepResearchButton from "./DeepResearchButton";

const SearchOptionsPopover = () => {
  const isWebSearchDisabled = useWebSearchStore((state) => state.isWebSearchDisabled);
  const isWebSearchOn = useWebSearchStore((state) => state.isWebSearchOn);
  const isDeepResearch = useDeepResearchStore((state) => state.isDeepResearch);

  const hasActiveOption = (isWebSearchOn && !isWebSearchDisabled) || isDeepResearch;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          className={`border ${
            hasActiveOption ? "border-blue-400 dark:border-green-400" : "dark:border-[#FAFAFA]"
          } bg-[#ffffff] dark:bg-[#2F2F2F] p-2 rounded-full flex items-center group`}
        >
          <MdTune
            className={`${
              hasActiveOption
                ? "fill-blue-400 dark:fill-green-400"
                : "fill-black dark:fill-white"
            }`}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="p-2 min-w-[200px] rounded-xl border border-[#E1E1E1] dark:border-[#444444] bg-[#FFFFFF] dark:bg-[#2F2F2F] cursor-pointer z-10 shadow-lg"
          sideOffset={5}
        >
          <WebSearchOption />
          <DeepResearchButton />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SearchOptionsPopover;
