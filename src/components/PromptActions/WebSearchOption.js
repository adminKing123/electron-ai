import { PiGlobe, PiGlobeX } from "react-icons/pi";
import { useModelStore, useWebSearchStore } from "../../store/usePromptStores";

const WebSearchOption = () => {
  const { model: selectedModel } = useModelStore();
  const {
    isWebSearchDisabled: disabled,
    isWebSearchOn: active,
    setIsWebSearchOn,
  } = useWebSearchStore();

  const handleClickWebSearch = () => {
    setIsWebSearchOn(!active);
  };

  return (
    <button
      onClick={handleClickWebSearch}
      title={
        selectedModel?.name && disabled
          ? `Web Search not available for ${selectedModel?.name}`
          : ""
      }
      disabled={disabled}
      className={`border ${
        active && !disabled ? "border-blue-400 dark:border-green-400" : ""
      } disabled:opacity-50 p-2 rounded-full group flex items-center`}
    >
      {disabled ? (
        <PiGlobeX className="fill-black dark:fill-white" />
      ) : (
        <PiGlobe
          className={`${
            active
              ? "fill-blue-400 dark:fill-green-400"
              : "fill-black dark:fill-white"
          }`}
        />
      )}

      <span
        className={`${
          active
            ? "text-blue-400 dark:text-green-400"
            : "text-black dark:text-white"
        } text-xs max-w-0 text-nowrap opacity-0 group-hover:max-w-[100px] group-hover:pl-2 group-hover:opacity-100 transition-[max-width,opacity,padding] duration-300 overflow-hidden`}
      >
        Web search
      </span>
    </button>
  );
};

export default WebSearchOption;
