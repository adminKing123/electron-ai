import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { PiGlobe, PiGlobeX } from "react-icons/pi";
import { SiTicktick } from "react-icons/si";
import { useModelStore, useWebSearchStore } from "../../store/usePromptStores";

const WebSearchOption = () => {
  const selectedModel = useModelStore((state) => state.model);
  const isWebSearchDisabled = useWebSearchStore((state) => state.isWebSearchDisabled);
  const isWebSearchOn = useWebSearchStore((state) => state.isWebSearchOn);
  const setIsWebSearchOn = useWebSearchStore((state) => state.setIsWebSearchOn);

  const handleWebSearchToggle = () => {
    if (!isWebSearchDisabled) {
      setIsWebSearchOn(!isWebSearchOn);
    }
  };

  return (
    <DropdownMenu.Item
      onSelect={(e) => {
        e.preventDefault();
        handleWebSearchToggle();
      }}
      disabled={isWebSearchDisabled}
      title={
        isWebSearchDisabled && selectedModel?.name
          ? `Not available for ${selectedModel.name}`
          : ""
      }
      className={`px-3 py-2.5 text-sm rounded-xl outline-none flex items-center justify-between gap-3 ${
        isWebSearchDisabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-[#F5F5F5] dark:hover:bg-[#444444]"
      }`}
    >
      <div className="flex items-center gap-2">
        {isWebSearchDisabled ? (
          <PiGlobeX className="w-4 h-4 fill-black dark:fill-white flex-shrink-0" />
        ) : (
          <PiGlobe
            className={`w-4 h-4 flex-shrink-0 ${
              isWebSearchOn
                ? "fill-blue-400 dark:fill-green-400"
                : "fill-black dark:fill-white"
            }`}
          />
        )}
        <span
          className={`${
            isWebSearchOn && !isWebSearchDisabled
              ? "text-blue-400 dark:text-green-400"
              : "text-black dark:text-white"
          }`}
        >
          Web Search
        </span>
      </div>
      {isWebSearchOn && !isWebSearchDisabled && (
        <SiTicktick className="w-3 h-3 fill-blue-400 dark:fill-green-400 flex-shrink-0" />
      )}
    </DropdownMenu.Item>
  );
};

export default WebSearchOption;
