const MessageInfo = ({ message }) => {
  const duration = message?.duration;

  if (duration)
    return (
      <div className="flex items-center justify-end mt-0.5">
        <div className="text-[11px] text-[#bbb] dark:text-[#3a3a3a]">
          {Math.floor(duration)}s
        </div>
      </div>
    );
};

export default MessageInfo;
