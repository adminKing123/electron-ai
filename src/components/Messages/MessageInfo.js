const MessageInfo = ({ message }) => {
  const duration = message?.duration;

  if (duration)
    return (
      <div className="flex items-center justify-end">
        <div className="text-xs text-[#5D5D5D] dark:text-[#b8b8b8]">
          Finished In: <span>{Math.floor(duration)}s</span> 
        </div>
      </div>
    );
};

export default MessageInfo;
