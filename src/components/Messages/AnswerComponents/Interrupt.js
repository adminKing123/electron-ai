import { useEffect } from "react";
import CONFIG from "../../../config";
import useMessageStore from "../../../store/useMessagesStore";
import usePromptStore from "../../../store/usePromptStores";
import { handleSend } from "../../../utils/handleSend";

const DecisionBadge = ({ decision }) => {
  let textColor = "text-gray-500";
  let text = "Unknown";
  if (decision === "approve") {
    textColor = "text-green-500";
    text = "Approved";
  } else if (decision === "reject") {
    textColor = "text-red-500";
    text = "Rejected";
  }
  return (
    <span
      className={`text-white dark:text-white text-xs font-bold rounded-md px-2 py-1 ${textColor}`}
    >
      {text}
    </span>
  );
};

const RejectButton = ({ ...props }) => {
  return (
    <button
      className="text-white dark:text-white text-xs bg-red-500 hover:bg-red-600 active:bg-red-700 font-semibold rounded-md px-2 py-1"
      {...props}
    >
      Reject
    </button>
  );
};

const ApproveButton = ({ ...props }) => {
  return (
    <button
      className="text-white dark:text-white text-xs bg-green-500 hover:bg-green-600 active:bg-green-700 font-semibold rounded-md px-2 py-1"
      {...props}
    >
      Approve
    </button>
  );
};

const UndoButton = ({ ...props }) => {
  return (
    <button
      className="text-white dark:text-white text-xs bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 font-semibold rounded-md px-2 py-1"
      {...props}
    >
      Undo
    </button>
  );
};

const ActionRequest = ({
  index,
  message_id,
  action_request,
  review_config,
  descision,
  chat,
}) => {
  const { name, description } = action_request;
  const { allowed_decisions } = review_config || [];
  const setAction = usePromptStore((state) => state.setAction);
  const setActionRequestDecision = useMessageStore(
    (state) => state.setActionRequestDecision
  );

  const handleDecision = async (decision) => {
    const descisions = setActionRequestDecision(
      message_id,
      index,
      decision?.type ? decision.type : null
    );
    const remainingCount = descisions.filter((d) => d.type === null).length;
    if (remainingCount === 0) {
      await setAction({
        type: CONFIG.PROMPT_ACTION_TYPES.INTERRUPT_CONTINUE,
        data: {
          message_id: message_id,
          descisions: descisions,
        },
      });
      handleSend(chat);
    }
  };

  return (
    <div className="border border-[#E4E4E4] dark:border-[#454545] bg-[#f6f6f6] dark:bg-[#292929] rounded-xl px-5 py-3">
      <div>
        <h3 className="text-black dark:text-white font-semibold italic">
          <span>{name}</span>
        </h3>
        <p className="text-[13px] text-[#333333] dark:text-[#CCCCCC]">
          <pre className="text-wrap">{description}</pre>
        </p>
      </div>

      {descision ? (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          <UndoButton key={index} onClick={() => handleDecision(null)} />
          <DecisionBadge decision={descision} />
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {allowed_decisions.map((decision, index) =>
            decision === "approve" ? (
              <ApproveButton
                key={index}
                onClick={() => handleDecision({ type: decision })}
              />
            ) : decision === "reject" ? (
              <RejectButton
                key={index}
                onClick={() => handleDecision({ type: decision })}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

const Interrupt = ({ chat, message_id, interrupt }) => {
  const interrupt_id = interrupt?.id;
  const action_requests = interrupt?.value?.action_requests || [];
  const review_configs = interrupt?.value?.review_configs || [];

  useEffect(() => {
    const promptBox = document.getElementById("prompt-box");
    if (action_requests.length > 0 && interrupt_id) {
      promptBox.classList.add("hidden");
    } else {
      promptBox.classList.remove("hidden");
    }
    return () => {
      promptBox.classList.remove("hidden");
    };
  }, [action_requests]);

  if (action_requests.length === 0 || !interrupt_id) return null;

  return (
    <div className="flex flex-col gap-3 my-3">
      {action_requests.map((action_request, index) => (
        <ActionRequest
          key={index}
          index={index}
          message_id={message_id}
          action_request={action_request}
          review_config={review_configs[index]}
          descision={action_request?.decision}
          chat={chat}
        />
      ))}
    </div>
  );
};

export default Interrupt;
