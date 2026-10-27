import { motion } from "framer-motion";
import { formartJSON } from "../../../utils/helpers";

function StepWrapper({ children }) {
  return (
    <div className="mb-1.5 pl-5 relative">
      <div className="w-1 h-1 rounded-full bg-ink-200 dark:bg-ink-725 absolute left-[-2px] top-[7px]"></div>
      {children}
    </div>
  );
}

function JsonCodeBlock({ data }) {
  return (
    <div className="overflow-auto max-h-64 mt-1 p-3 bg-ink-50 dark:bg-ink-850 border border-ink-100 dark:border-ink-800 rounded-xl">
      <pre className="whitespace-pre text-[11px] text-ink-650 dark:text-ink-500 font-mono">
        <code>{formartJSON(data)}</code>
      </pre>
    </div>
  );
}

function ToolStep({ step, label, data }) {
  return (
    <StepWrapper>
      <div className="text-[12px] text-ink-500 dark:text-ink-550 mb-0.5">
        {label}: <span className="text-ink-650 dark:text-ink-450">{step.tool_name}</span>
      </div>
      <JsonCodeBlock data={data} />
    </StepWrapper>
  );
}

function Step({ step }) {
  switch (step.type) {
    case "tool_call":
      return <ToolStep step={step} label="Calling" data={step.tool_args} />;
    case "tool_result":
      return <ToolStep step={step} label="Result" data={step.tool_result} />;
    case "error":
      return (
        <StepWrapper>
          <div className="text-[12px] text-red-500 font-mono">
            {step.message}
          </div>
        </StepWrapper>
      );
    default:
      return (
        <StepWrapper>
          <div className="text-[12px] text-ink-600 dark:text-ink-500 leading-snug">
            {step.title}
          </div>
          {step.description && (
            <div className="text-[11px] text-ink-400 dark:text-ink-600 leading-snug mt-0.5">
              {step.description}
            </div>
          )}
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
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="mt-2 ml-[8px] border-l border-ink-100 dark:border-ink-800 pt-1"
    >
      {steps.map((step, index) => (
        <Step key={index} step={step} />
      ))}
    </motion.div>
  );
}

export default StepsList;
