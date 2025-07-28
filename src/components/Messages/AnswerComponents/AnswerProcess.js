import { useProcessController } from "../../../store/useMessagesStore";

const AnswerProcess = ({ message_id, steps }) => {
  const process = useProcessController(
    (state) => state.message_process?.[message_id]
  );
  const lastStep = steps[steps.length - 1];

  if (!process || process.id !== message_id) return null;
  if (lastStep?.type === "fetch_source_information")
    return (
      <div className="mt-3">
        <button className="skeleton w-[108px] h-[34px] rounded-full"></button>
      </div>
    );
};

export default AnswerProcess;
