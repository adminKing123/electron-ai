import { v4 as uuidv4 } from "uuid";
import GenerationPage from "./GenerationPage";

const NewChatPage = () => {
  const newChat = {
    id: uuidv4(),
    title: "New Chat",
    is_new: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return <GenerationPage chat={newChat} />;
};

export default NewChatPage;
