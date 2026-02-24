import { motion } from "framer-motion";
import { formartJSON } from "../../../utils/helpers";

function StepWrapper({ children }) {
  return (
    <div className="mb-2 pl-5 relative">
      <div className="w-[5px] h-[5px] rounded-full bg-[#b9b9b9] dark:bg-[#7c7c7c] absolute left-[-3px] top-[8px]"></div>
      {children}
    </div>
  );
}

function JsonCodeBlock({ data }) {
  return (
    <div className="overflow-auto max-h-96 p-2 bg-[#F9F9F9] dark:bg-[#171717] border border-[#E4E4E4] dark:border-[#454545] rounded-2xl">
      <pre className="whitespace-pre text-[13px] text-[#333333] dark:text-[#CCCCCC] font-mono">
        <code>{formartJSON(data)}</code>
      </pre>
    </div>
  );
}

function ToolStep({ step, label, data }) {
  return (
    <StepWrapper>
      <div className="text-[13px] text-[#333333] dark:text-[#CCCCCC] mb-1">
        {label}: {step.tool_name}
      </div>
      <JsonCodeBlock data={data} />
    </StepWrapper>
  );
}

function Step({ step }) {
  switch (step.type) {
    case "tool_call":
      return <ToolStep step={step} label="Calling tool" data={step.tool_args} />;
    case "tool_result":
      return <ToolStep step={step} label="Result" data={step.tool_result} />;
    case "error":
      return (
        <StepWrapper>
          <div className="text-[13px] text-red-600 font-mono mb-1">
            Error: {step.message}
          </div>
        </StepWrapper>
      );
    default:
      return (
        <StepWrapper>
          <div className="text-[13px] text-[#000000] dark:text-white mb-1">
            {step.title}
          </div>
          <div className="text-[13px] text-[#333333] dark:text-[#CCCCCC]">
            {step.description}
          </div>
        </StepWrapper>
      );
  }
}

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
        <Step key={index} step={step} />
      ))}
    </motion.div>
  );
}

export default StepsList;
