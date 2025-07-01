import { FaAngleDown } from "react-icons/fa6";
import { TbGalaxy } from "react-icons/tb";
import { useProcessController } from "../../store/useMessagesStore";

function AnswerSteps({ steps, message_id }) {
  const process = useProcessController(
    (state) => state.message_process?.[message_id]
  );
  const lastStep = steps[steps.length - 1];
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <TbGalaxy
          className={`text-[#000000] dark:text-white w-[22px] h-[22px] ${
            process?.id === message_id ? "spin-animation" : ""
          }`}
        />
        <button className="text-[11px] text-[#000000] dark:text-white rounded-2xl flex items-center gap-1">
          <span>{lastStep.title}</span>
          <span>
            <FaAngleDown className="text-[#000000] dark:text-white text-[11px]" />
          </span>
        </button>
      </div>
    </div>
  );
}

export default AnswerSteps;
