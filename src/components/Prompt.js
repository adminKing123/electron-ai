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

const Prompt = ({ chat_id }) => {
  const { addMessage, addChunkInMessageAnswer } = useMessageStore();
  const textareaRef = useRef(null);

  const onProgress = (data) => {
    addChunkInMessageAnswer(data.id, data.chunk);
  };

  const onStart = (data) => {
    scrollToMessage(data.id);
  };

  const onEnd = () => {};

  const onError = () => {};

  const handleSend = () => {
    const { prompt, setPrompt } = usePromptStore.getState();
    const { model } = useModelStore.getState();
    const { process } = useProcessController.getState();
    const isPromptSendDisabled =
      process || !prompt.trim() || model === null ? true : false;

    if (isPromptSendDisabled) return;

    const { isWebSearchDisabled, isWebSearchOn } = useWebSearchStore.getState();
    const google_search = isWebSearchDisabled ? false : isWebSearchOn;

    const id = addMessage({
      prompt,
      answer: "",
      model: model,
      google_search,
    });
    handleStream(
      id,
      {
        chat_id,
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
    <div className="w-full relative">
      <div className="px-5 py-[15px] bg-[#0f0f0f] rounded-3xl border-[2px] border-[#1c1e21]">
        <TextArea textareaRef={textareaRef} handleSend={handleSend} />
        <PromptActions handleSend={handleSend} />
      </div>
    </div>
  );
};

export default Prompt;
