import { useLocation, useParams } from "react-router-dom";
import GenerationPage from "./GenerationPage";

function ChatPage() {
  const state = useLocation().state;
  const { id } = useParams();
  
  if (state && state.chat) {
    return <GenerationPage chat={state.chat} />;
  }
  const chat = {
    id: id,
    title: "New Chat",
    is_new: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return <GenerationPage chat={chat} />;
}

export default ChatPage;
