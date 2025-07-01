import { FaAngleDown } from "react-icons/fa6";
import { TbGalaxy } from "react-icons/tb";

function AnswerSteps({ steps }) {
  const lastStep = steps[steps.length - 1];
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <TbGalaxy
          className={`text-[#000000] dark:text-white w-[22px] h-[22px] ${
            lastStep?.type === "finished" ? "" : "spin-animation"
          }`}
        />
        <button className="text-[11px] rounded-2xl flex items-center gap-1">
          <span>{lastStep.title}</span>
          <span>
            <FaAngleDown />
          </span>
        </button>
      </div>
    </div>
  );
}

export default AnswerSteps;
