import { useProcessController } from "../../../store/useMessagesStore";
import { getClassNameWithAspectRatio } from "../../../utils/helpers";

const AnswerProcess = ({ message_id, steps }) => {
  const process = useProcessController(
    (state) => state.message_process?.[message_id],
  );
  const lastStep = steps[steps.length - 1];

  if (!process || process.id !== message_id) return null;
  if (lastStep?.type === "fetch_source_information")
    return (
      <div className="mt-3">
        <button className="skeleton w-[108px] h-[34px] rounded-full"></button>
      </div>
    );
  if (lastStep?.type === "image_generation") {
    return (
      <div className="my-4">
        <div 
          className={`skeleton ${getClassNameWithAspectRatio(lastStep?.detail?.aspect_ratio)} rounded-2xl`}
        ></div>
      </div>
    );
  }
};

export default AnswerProcess;
