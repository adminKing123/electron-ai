import useUserStore from "../store/useUserStore";

function ChatGreetings() {
  const user = useUserStore((state) => state.user);

  const displayName = user?.displayName || "";
  const firstName = displayName.trim().split(" ")[0] || "";

  const greets = [
    "What can I help with?",
    "Ready to help today!",
    "Ask Electron AI anything :)",
    "What's on your mind?",
    "I'm here 👀",
  ];

  const nameGreets = firstName
    ? [
        `Hey ${firstName}, what's up?`,
        `Yo ${firstName} 😇, need help?`,
        `${firstName}, what are we building today?`,
        `Alright ${firstName}, talk to me.`,
        `What's the plan, ${firstName}?`,
        `${firstName}, let's search!`,
        `Need something, ${firstName}?`,
      ]
    : [];

  const allGreets = [...nameGreets, ...greets];
  const randomGreeting =
    allGreets[Math.floor(Math.random() * allGreets.length)];

  return (
    <h2 className="text-black dark:text-white w-full text-center text-[22px] min-[474px]:text-[28px] absolute bottom-full h-[70px]">
      {randomGreeting}
    </h2>
  );
}

export default ChatGreetings;
