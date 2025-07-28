import { IoTelescope } from "react-icons/io5";
import { useDeepResearchStore } from "../../store/usePromptStores";

const DeepResearchButton = () => {
  const active = useDeepResearchStore((state) => state.isDeepResearch);
  const setIsDeepResearch = useDeepResearchStore(
    (state) => state.setIsDeepResearch
  );

  const handleClick = () => {
    setIsDeepResearch(!active);
  };

  return (
    <button
      title="Deep Research"
      className={`border ${
        active ? "border-blue-400 dark:border-green-400" : ""
      } disabled:opacity-50 p-2 rounded-full group flex items-center`}
      onClick={handleClick}
    >
      <IoTelescope
        className={`${
          active
            ? "fill-blue-400 dark:fill-green-400"
            : "fill-black dark:fill-white"
        }`}
      />
      <span
        className={`${
          active
            ? "text-blue-400 dark:text-green-400"
            : "text-black dark:text-white"
        } text-xs max-w-0 text-nowrap opacity-0 group-hover:max-w-[100px] group-hover:pl-2 group-hover:opacity-100 transition-[max-width,opacity,padding] duration-300 overflow-hidden`}
      >
        Deep Research
      </span>
    </button>
  );
};

export default DeepResearchButton;
