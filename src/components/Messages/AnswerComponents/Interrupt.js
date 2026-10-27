import { useEffect } from "react";
import CONFIG from "../../../config";
import useMessageStore from "../../../store/useMessagesStore";
import usePromptStore from "../../../store/usePromptStores";
import { handleSend } from "../../../utils/handleSend";

const DecisionBadge = ({ decision }) => {
  let cls = "text-ink-500 dark:text-ink-550 bg-ink-75 dark:bg-ink-800 border border-ink-150 dark:border-ink-750";
  let text = "Unknown";
  if (decision === "approve") {
    cls = "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40";
    text = "Approved";
  } else if (decision === "reject") {
    cls = "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40";
    text = "Rejected";
  }
  return (
    <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${cls}`}>
      {text}
    </span>
  );
};

const RejectButton = ({ ...props }) => (
  <button
    className="text-white text-[12px] font-medium rounded-full px-3 py-1.5
      bg-red-500 hover:bg-red-600 active:bg-red-700
      transition-colors"
    {...props}
  >
    Reject
  </button>
);

const ApproveButton = ({ ...props }) => (
  <button
    className="text-white text-[12px] font-medium rounded-full px-3 py-1.5
      bg-green-500 hover:bg-green-600 active:bg-green-700
      transition-colors"
    {...props}
  >
    Approve
  </button>
);

const UndoButton = ({ ...props }) => (
  <button
    className="text-[12px] font-medium rounded-full px-3 py-1.5
      border border-ink-150 dark:border-ink-750
      bg-ink-75 dark:bg-ink-800
      text-ink-600 dark:text-ink-400
      hover:bg-ink-100 dark:hover:bg-ink-750
      transition-colors"
    {...props}
  >
    Undo
  </button>
);

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
    <div className="border border-ink-100 dark:border-ink-800 bg-ink-25 dark:bg-ink-825 rounded-2xl px-4 py-3.5">
      <div>
        <h3 className="text-[13px] font-semibold text-ink-975 dark:text-white italic mb-1">
          {name}
        </h3>
        <p className="text-[13px] text-ink-600 dark:text-ink-500 leading-relaxed">
          <pre className="text-wrap font-sans m-0 whitespace-pre-wrap">{description}</pre>
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
