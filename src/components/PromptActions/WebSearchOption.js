import { PiGlobe, PiGlobeX } from "react-icons/pi";

const WebSearchOption = ({ disabled, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`border ${
        active ? "bg-[#ffffff] border-blue-400" : "hover:bg-[#C1C1C1]"
      } disabled:opacity-50 p-2 rounded-full group`}
    >
      {disabled ? (
        <PiGlobeX />
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
