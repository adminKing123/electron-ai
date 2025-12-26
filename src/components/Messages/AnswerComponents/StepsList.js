import { motion } from "framer-motion";
import { formartJSON } from "../../../utils/helpers";

function ToolCall({ step }) {
  return (
    <div className="mb-2 pl-5 relative">
      <div className="w-[5px] h-[5px] rounded-full bg-[#b9b9b9] dark:bg-[#7c7c7c] absolute left-[-3px] top-[8px]"></div>
      <div className="text-[13px] text-[#333333] dark:text-[#CCCCCC] mb-1">
        Calling tool: {step.tool_name}
      </div>
      <div className="overflow-auto max-h-96 p-2 bg-[#F9F9F9] dark:bg-[#171717] border border-[#E4E4E4] dark:border-[#454545] rounded-2xl">
        <pre className="whitespace-pre text-[13px] text-[#333333] dark:text-[#CCCCCC] font-mono">
          <code>{formartJSON(step.tool_args)}</code>
        </pre>
      </div>
    </div>
  );
}

function ToolResult({ step }) {
  return (
    <div className="mb-2 pl-5 relative">
      <div className="w-[5px] h-[5px] rounded-full bg-[#b9b9b9] dark:bg-[#7c7c7c] absolute left-[-3px] top-[8px]"></div>
      <div className="text-[13px] text-[#333333] dark:text-[#CCCCCC] mb-1">
        Result: {step.tool_name}
      </div>
      <div className="overflow-auto max-h-96 p-2 bg-[#F9F9F9] dark:bg-[#171717] border border-[#E4E4E4] dark:border-[#454545] rounded-2xl">
        <pre className="whitespace-pre text-[13px] text-[#333333] dark:text-[#CCCCCC] font-mono">
          <code>{formartJSON(step.tool_result)}</code>
        </pre>
      </div>
    </div>
  );
}

function Step({ step }) {
  switch (step.type) {
    case "tool_call":
      return <ToolCall step={step} />;
    case "tool_result":
      return <ToolResult step={step} />;
    default:
      return (
        <div className="mb-2 pl-5 relative">
          <div className="w-[5px] h-[5px] rounded-full bg-[#b9b9b9] dark:bg-[#7c7c7c] absolute left-[-3px] top-[8px]"></div>
          <div className="text-[13px] text-[#000000] dark:text-white mb-1">
            {step.title}
          </div>
          <div className="text-[13px] text-[#333333] dark:text-[#CCCCCC]">
            {step.description}
          </div>
        </div>
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
