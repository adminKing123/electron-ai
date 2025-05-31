function ChatGreetings({ chat }) {
  return chat.is_new ? (
    <h2 className="text-black dark:text-white w-full text-center text-[28px] absolute bottom-full h-[70px]">
      What can I help with?
    </h2>
  ) : null;
}

export default ChatGreetings;
