function ChatGreetings({ chat }) {
  return chat.is_new ? (
    <h2 className="w-full text-center text-[28px] absolute bottom-[140px]">
      What can I help with?
    </h2>
  ) : null;
}

export default ChatGreetings;
