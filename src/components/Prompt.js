import { v4 as uuidv4 } from "uuid";
import { useRef } from "react";
import useMessageStore, {
  useProcessController,
} from "../store/useMessagesStore";
import { scrollToMessage } from "../utils/helpers";
import PromptActions from "./PromptActions";
import handleStream from "../apis/prompt_generation/handleStream";
import usePromptStore, {
  useModelStore,
  useWebSearchStore,
} from "../store/usePromptStores";
import TextArea from "./TextArea";
import { useNavigate } from "react-router-dom";
import useChatsStore from "../store/useChatsStore";
import ROUTES from "../router/routes";
import ChatGreetings from "./ChatGreetings";
import { createMessageAPI } from "../apis/messages/queryFunctions";
import ScrollToBottomButton from "./PromptActions/ScrollToBottomButton";

const Prompt = ({ chat }) => {
  const navigate = useNavigate();
  const addMessage = useMessageStore((state) => state.addMessage);
  const addChunkInMessageAnswer = useMessageStore(
    (state) => state.addChunkInMessageAnswer
  );

  const textareaRef = useRef(null);

  const onProgress = (data) => {
    addChunkInMessageAnswer(data.id, data.event);
  };

  const onStart = (data) => {
    scrollToMessage(data.id);
  };

  const onEnd = (data) => {
    const messageAdded = useMessageStore.getState().data[data.id];
    createMessageAPI(chat, messageAdded);
  };

  const onError = (data) => {
    addChunkInMessageAnswer(data.id, {
      type: "step",
      data: {
        id: uuidv4(),
        data: [
          {
            type: "stop",
            title: "Stopped",
          },
        ],
      },
    });
    const messageAdded = useMessageStore.getState().data[data.id];
    createMessageAPI(chat, messageAdded);
  };

  const handleNewChatEntered = (chat, summarization_data) => {
    useChatsStore.getState().addChat({
      ...chat,
      summarization_data,
    });
    navigate(ROUTES.GET_CHAT_PAGE_URL(chat.id), {
      state: { chat: { ...chat, is_new: false, shouldAutoFocus: false } },
    });
  };

  const handleSend = () => {
    const { prompt, setPrompt } = usePromptStore.getState();
    const { model } = useModelStore.getState();
    const { process } = useProcessController.getState();
    const { isWebSearchDisabled, isWebSearchOn } = useWebSearchStore.getState();

    const isPromptSendDisabled =
      process || !prompt.trim() || model === null ? true : false;

    if (isPromptSendDisabled) return;

    const google_search = isWebSearchDisabled ? false : isWebSearchOn;
    const generate_image = false;

    const id = addMessage({
      prompt,
      answer: [],
      sources: [],
      steps: [],
      model: model,
      google_search,
      generate_image,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (chat.is_new) {
      handleNewChatEntered(chat, {
        prompt_to_summerize_title: prompt,
      });
    }

    handleStream(
      id,
      {
        chat_id: chat.id,
        prompt,
        google_search,
        model_id: model?.id,
      },
      onProgress,
      onStart,
      onEnd,
      onError
    );
    setPrompt("");
  };

  return (
    <div className="w-full relative" id="prompt-box">
      <ScrollToBottomButton />
      <ChatGreetings chat={chat} />
      <div className="px-5 py-[15px] bg-[#FFFFFF] dark:bg-[#303030] rounded-3xl border-[2px] border-[#E2E2E2] dark:border-[#1c1e21]">
        <TextArea
          textareaRef={textareaRef}
          handleSend={handleSend}
          shouldAutoFocus={chat.shouldAutoFocus ? true : false}
        />
        <PromptActions handleSend={handleSend} />
      </div>
    </div>
  );
};

export default Prompt;
