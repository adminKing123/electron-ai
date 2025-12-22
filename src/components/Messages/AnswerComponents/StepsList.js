import { motion } from "framer-motion";

function StepsList({ steps }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="mt-2 ml-[11px] border-l border-[#E4E4E4] dark:border-[#454545]"
    >
      {steps.map((step, index) => (
        <div key={step.id} className="mb-2 pl-5 relative">
            <div className="w-[5px] h-[5px] rounded-full bg-[#b9b9b9] dark:bg-[#7c7c7c] absolute left-[-3px] top-[8px]"></div>
          <div className="text-[13px] text-[#000000] dark:text-white mb-1">
            {step.title}
          </div>
          <div className="text-[13px] text-[#333333] dark:text-[#CCCCCC]">
            {step.description}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

export default StepsList;
