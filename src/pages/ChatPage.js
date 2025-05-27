import { useLocation } from "react-router-dom";
import GenerationPage from "./GenerationPage";

function ChatPage() {
  const state = useLocation().state;
  if (state && state.chat) {
    return <GenerationPage chat={state.chat} />;
  }

  const chat = {
    id: "old-chat-id",
    title: "New Chat",
    is_new: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return <GenerationPage chat={chat} />;
}

export default ChatPage;
