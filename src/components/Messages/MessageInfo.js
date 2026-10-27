const MessageInfo = ({ message }) => {
  const duration = message?.duration;

  if (duration)
    return (
      <div className="flex items-center justify-end mt-0.5">
        <div className="text-[11px] text-ink-450 dark:text-ink-600">
          {Math.floor(duration)}s
        </div>
      </div>
    );
};

export default MessageInfo;
