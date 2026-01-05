const RejectButton = () => {
  return (
    <button className="text-white dark:text-white text-xs bg-red-500 font-semibold rounded-md px-2 py-1">
      Reject
    </button>
  );
};

const ApproveButton = () => {
  return (
    <button className="text-white dark:text-white text-xs bg-green-500 font-semibold rounded-md px-2 py-1">
      Approve
    </button>
  );
};

const ActionRequest = ({ message_id, action_request, review_config }) => {
  const { name, description, args } = action_request;
  const { allowed_decisions } = review_config || [];

  return (
    <div className="border border-[#E4E4E4] dark:border-[#454545] bg-[#f6f6f6] dark:bg-[#292929] rounded-xl px-5 py-3">
      <div className="mb-3">
        <h3 className="text-black dark:text-white font-semibold italic">
          <span>{name}</span>
        </h3>
        <p className="text-[13px] text-[#333333] dark:text-[#CCCCCC]">
          <pre>{description}</pre>
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {allowed_decisions.map((decision, index) =>
          decision === "approve" ? (
            <ApproveButton key={index} />
          ) : decision === "reject" ? (
            <RejectButton key={index} />
          ) : null
        )}
      </div>
    </div>
  );
};

const Interrupt = ({ message_id, interrupt }) => {
  const interrupt_id = interrupt?.id;
  const action_requests = interrupt?.value?.action_requests || [];
  const review_configs = interrupt?.value?.review_configs || [];

  if (action_requests.length === 0 || !interrupt_id) return null;

  return (
    <div>
      {action_requests.map((action_request, index) => (
        <ActionRequest
          key={index}
          message_id={message_id}
          action_request={action_request}
          review_config={review_configs[index]}
        />
      ))}
    </div>
  );
};

export default Interrupt;
