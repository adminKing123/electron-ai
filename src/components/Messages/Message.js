import React from "react";
import Answer from "./Answer";
import MessageActions from "./MessageActions";
import MessagePrompt from "./MessagePrompt";

const Message = React.memo(({ message_id, chat }) => {
  return (
    <div
      id={message_id}
      className="last:min-h-full max-w-[788px] px-5 mx-auto pb-24 last:pb-10"
    >
      <MessagePrompt message_id={message_id} />
      <div className="group">
        <Answer message_id={message_id} />
        <MessageActions message_id={message_id} chat={chat} />
      </div>
    </div>
  );
});

export default Message;
