import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FaAngleDown } from "react-icons/fa6";
import { TbGalaxy } from "react-icons/tb";
import { useProcessController } from "../../../store/useMessagesStore";
import StepsList from "./StepsList";

function AnswerSteps({ steps, message_id }) {
  const [isOpen, setIsOpen] = useState(false);
  const process = useProcessController(
    (state) => state.message_process?.[message_id],
  );
  const lastStep = steps[steps.length - 1];
  const isError = lastStep?.type === "error";

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <TbGalaxy
          className={`w-[18px] h-[18px] flex-shrink-0 ${
            isError ? "text-red-500" : "text-[#888] dark:text-[#888]"
          } ${process?.id === message_id ? "spin-animation" : ""}`}
        />
        <button
          onClick={handleToggle}
          className={`text-[12px] font-medium flex items-center gap-1 hover:opacity-70 transition-opacity ${
            isError ? "text-red-500" : "text-[#666] dark:text-[#888]"
          }`}
        >
          <span>{lastStep.title}</span>
          <FaAngleDown
            className={`w-[11px] h-[11px] transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      <AnimatePresence>{isOpen && <StepsList steps={steps} />}</AnimatePresence>
    </div>
  );
}

export default AnswerSteps;
