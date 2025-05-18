import { PiGlobe, PiGlobeX } from "react-icons/pi";

const WebSearchOption = ({ disabled, active, onClick, selectedModel }) => {
  return (
    <button
      onClick={onClick}
      title={
        selectedModel?.name && disabled
          ? `Web Search not available for ${selectedModel?.name}`
          : ""
      }
      disabled={disabled}
      className={`border ${
        active && !disabled
          ? "bg-blue-100 border-blue-400"
          : "hover:bg-[#C1C1C1]"
      } disabled:opacity-50 p-2 rounded-full group`}
    >
      {disabled ? (
        <PiGlobeX className="fill-white" />
      ) : (
        <PiGlobe
          className={`${
            active ? "fill-blue-400" : "fill-white group-hover:fill-black"
          }`}
        />
      )}
    </button>
  );
};

export default WebSearchOption;
