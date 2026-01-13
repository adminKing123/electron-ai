import { v4 as uuidv4 } from "uuid";
import GenerationPage from "./GenerationPage";
import { useEffect } from "react";
import useMessageStore from "../store/useMessagesStore";

const NewChatPage = () => {
  const newChat = {
    id: uuidv4(),
    title: "New Chat",
    is_new: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    shouldAutoFocus: true,
  };

  const resetMessages = useMessageStore((state) => state.resetMessages);

  useEffect(() => {
    const header = document.getElementById("header");
    header.classList.remove("header-shadow");
    resetMessages();
  }, [resetMessages]);

  return <GenerationPage chat={newChat} />;
};

export default NewChatPage;
