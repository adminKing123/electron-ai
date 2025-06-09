import { v4 as uuidv4 } from "uuid";
import GenerationPage from "./GenerationPage";
import { useEffect } from "react";
import useMessageStore from "../store/useMessagesStore";

const NewChatPage = () => {
  const newChat = {
    id: uuidv4(),
    title: "New Chat",
    is_new: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const resetMessages = useMessageStore((state) => state.resetMessages);

  useEffect(() => {
    resetMessages();
  }, []);

  return <GenerationPage chat={newChat} />;
};

export default NewChatPage;
