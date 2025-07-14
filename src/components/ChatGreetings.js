function ChatGreetings() {
  const greets = [
    "What can I help with?",
    "How may I assist you?",
    "Ready to help today!",
    "Ask Noney anything :)",
    "What's on your mind?",
    "Let's solve it today!",
    "How can Noney help?",
    "Welcome! Ask me today.",
    "Noney is here to help!",
    "What shall we explore?",
    "Let's get started now!",
    "Your assistant, Noney.",
    "Hello! How can I help?",
    "What brings you here?",
    "Need assistance today?",
    "I'm here to help you!",
    "Let's chat about it!",
    "Share your thoughts!",
    "What's the question?",
    "Ready when you are!",
    "Noney at your service!",
    "How's your day going?",
    "What can we solve?",
    "I'm listening :)",
    "Fire away!",
    "Let's figure it out!",
    "What's up today?",
    "Talk to me!",
    "Ready to assist!",
    "What's happening?",
    "Ask away!",
    "Let's dive in!",
    "What do you need?",
    "Here to help!",
    "Got questions?",
    "I'm all ears!",
    "Noney's ready!",
    "What's new?",
    "Let me help!",
    "Speak your mind!",
    "What's the task?",
    "Ready to chat!",
  ];

  const randomGreeting = greets[Math.floor(Math.random() * greets.length)];

  return (
    <h2 className="text-black dark:text-white w-full text-center text-[28px] absolute bottom-full h-[70px]">
      {randomGreeting}
    </h2>
  );
}

export default ChatGreetings;
