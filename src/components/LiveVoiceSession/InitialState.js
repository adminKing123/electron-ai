import { IoMic } from "react-icons/io5";

const InitialState = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-3">
          Gemini Live Voice
        </h1>
        <p className="text-[#666666] dark:text-[#aaa] text-sm">
          Have a natural conversation with AI
        </p>
      </div>
      <button
        onClick={onStart}
        className="flex items-center gap-3 px-8 py-4 bg-[#f2f2f2] dark:bg-[#2c2c2c] hover:bg-[#EAEAEA] dark:hover:bg-[#3A3A3A] border border-gray-200 dark:border-[#2f2f2f] rounded-3xl transition-colors"
      >
        <IoMic className="w-6 h-6 text-black dark:text-white" />
        <span className="text-black dark:text-white font-medium text-lg">
          Start Conversation
        </span>
      </button>
    </div>
  );
};

export default InitialState;
