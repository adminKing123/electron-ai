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
        active && !disabled ? "border-green-400" : ""
      } disabled:opacity-50 p-2 rounded-full group`}
    >
      {disabled ? (
        <PiGlobeX className="fill-white" />
      ) : (
        <PiGlobe className={`${active ? "fill-green-400" : "fill-white"}`} />
      )}
    </button>
  );
};

export default WebSearchOption;
