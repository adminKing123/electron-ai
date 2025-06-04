import { Navigate, useLocation, useParams } from "react-router-dom";
import GenerationPage from "./GenerationPage";
import { useEffect, useState } from "react";
import { getMessagesForChatAPI } from "../apis/messages/queryFunctions";
import useMessageStore from "../store/useMessagesStore";
import ROUTES from "../router/routes";

const STATUS = {
  LOADING: "LOADING",
  FAILED: "FAILED",
  LOADED: "LOADED",
};

const LoadPage = ({ id }) => {
  const [chat, setChat] = useState(null);
  const [status, setStatus] = useState(STATUS.LOADING);
  const setMessages = useMessageStore((state) => state.setMessages);

  useEffect(() => {
    const getInitialData = async () => {
      setStatus(STATUS.LOADING);
      const response = await getMessagesForChatAPI({ id });
      if (response?.chat?.id) {
        setChat(response?.chat);
        setMessages(response?.messages || []);
        setStatus(STATUS.LOADED);
      } else {
        setStatus(STATUS.FAILED);
      }
    };
    getInitialData();
  }, [id, setMessages]);

  if (status === STATUS.LOADING) return null;
  else if (status === STATUS.FAILED) return <Navigate to={ROUTES.INDEX} />;
  return <GenerationPage chat={{ ...chat, scroll_to_bottom: true }} />;
};

function ChatPage() {
  const state = useLocation().state;
  const { id } = useParams();

  if (state && state.chat) {
    window.history.replaceState({}, "");
    return <GenerationPage chat={state.chat} />;
  }

  return <LoadPage id={id} />;
}

export default ChatPage;
