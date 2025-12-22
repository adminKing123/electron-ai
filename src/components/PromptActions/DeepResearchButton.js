import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { IoTelescope } from "react-icons/io5";
import { SiTicktick } from "react-icons/si";
import { useDeepResearchStore } from "../../store/usePromptStores";

const DeepResearchButton = () => {
  const isDeepResearch = useDeepResearchStore((state) => state.isDeepResearch);
  const setIsDeepResearch = useDeepResearchStore(
    (state) => state.setIsDeepResearch
  );

  const handleDeepResearchToggle = () => {
    setIsDeepResearch(!isDeepResearch);
  };

  return (
    <DropdownMenu.Item
      onSelect={(e) => {
        e.preventDefault();
        handleDeepResearchToggle();
      }}
      className="px-3 py-2.5 text-sm rounded-xl outline-none flex items-center justify-between gap-3 hover:bg-[#F5F5F5] dark:hover:bg-[#444444]"
    >
      <div className="flex items-center gap-2">
        <IoTelescope
          className={`w-4 h-4 flex-shrink-0 ${
            isDeepResearch
              ? "fill-blue-400 dark:fill-green-400"
              : "fill-black dark:fill-white"
          }`}
        />
        <span
          className={`${
            isDeepResearch
              ? "text-blue-400 dark:text-green-400"
              : "text-black dark:text-white"
          }`}
        >
          Deep Research
        </span>
      </div>
      {isDeepResearch && (
        <SiTicktick className="w-3 h-3 fill-blue-400 dark:fill-green-400 flex-shrink-0" />
      )}
    </DropdownMenu.Item>
  );
};

export default DeepResearchButton;
