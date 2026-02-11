import { IoMic, IoMicOff } from "react-icons/io5";
import { MdStop } from "react-icons/md";

const ActiveState = ({ isMuted, onToggleMute, onStop }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMute}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${
            isMuted
              ? "bg-red-500 hover:bg-red-600 border-red-400"
              : "bg-[#10b981] hover:bg-[#059669] border-[#10b981]"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <IoMicOff className="w-8 h-8 text-white" />
          ) : (
            <IoMic className="w-8 h-8 text-white" />
          )}
        </button>

        <button
          onClick={onStop}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 border-2 border-red-400 flex items-center justify-center transition-all"
          title="Stop"
        >
          <MdStop className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
};

export default ActiveState;
