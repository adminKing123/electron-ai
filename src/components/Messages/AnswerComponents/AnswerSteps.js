import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FaAngleDown } from "react-icons/fa6";
import { TbGalaxy } from "react-icons/tb";
import { useProcessController } from "../../../store/useMessagesStore";
import StepsList from "./StepsList";

function AnswerSteps({ steps, message_id }) {
  const [isOpen, setIsOpen] = useState(false);
  const process = useProcessController(
    (state) => state.message_process?.[message_id]
  );
  const lastStep = steps[steps.length - 1];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <TbGalaxy
          className={`text-[#000000] dark:text-white w-[24px] h-[24px] ${
            process?.id === message_id ? "spin-animation" : ""
          }`}
        />
        <button
          onClick={handleToggle}
          className="text-[11px] text-[#000000] dark:text-white rounded-2xl flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <span>{lastStep.title}</span>
          <span>
            <FaAngleDown
              className={`text-[#000000] dark:text-white text-[11px] transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>
      </div>
      <AnimatePresence>
        {isOpen && <StepsList steps={steps} />}
      </AnimatePresence>
    </div>
  );
}

export default AnswerSteps;
