import { useEffect } from "react";
import usePromptStore, {
  useDeepResearchStore,
  useModelStore,
  useWebSearchStore,
} from "../../store/usePromptStores";
import debounce from "lodash.debounce";
import { getDraftAPI, saveDraftAPI } from "../../apis/chats/queryFunctions";
import CONFIG from "../../config";

let last_fetch_chat_draft = null;

const handlePromptChange = debounce((chat, data) => {
  saveDraftAPI(
    {
      ...chat,
      id: chat?.is_new ? CONFIG.NEW_CHAT_DRAFT_ID : chat.id,
    },
    data
  );
}, CONFIG.DRAFT_SAVE_DEBOUNCE_MS);

function PromptDraftMaintainer({ chat }) {
  const { prompt, setPrompt } = usePromptStore();
  const { model, setModel } = useModelStore();
  const { isWebSearchOn, setIsWebSearchOn, setIsWebSearchDisabled } =
    useWebSearchStore();
  const { isDeepResearch, setIsDeepResearch } = useDeepResearchStore();

  useEffect(() => {
    if (chat?.id && last_fetch_chat_draft?.id === chat.id) {
      handlePromptChange(chat, {
        prompt: prompt,
        model: model,
        isWebSearchOn: isWebSearchOn,
        isDeepResearch: isDeepResearch,
        type: useModelStore.getState().type,
      });
    }
  }, [chat, prompt, model, isWebSearchOn, isDeepResearch]);

  useEffect(() => {
    const promptInnerBoxEle = document.getElementById("inner-prompt-box");
    const aiTypeTogglerEle = document.getElementById("ai-type-toggler");
    const getDraft = async () => {
      promptInnerBoxEle.classList.add("fd-state");
      aiTypeTogglerEle.classList.add("hidden");
      const data = await getDraftAPI(
        chat?.is_new ? CONFIG.NEW_CHAT_DRAFT_ID : chat.id
      );
      setPrompt(data?.prompt || "");
      setModel(data?.model || CONFIG.AI_MODELS[CONFIG.AI_DEFAULT_TYPE.id].default_model);
      setIsWebSearchOn(data?.isWebSearchOn || false);
      setIsDeepResearch(data?.isDeepResearch || false);
      setIsWebSearchDisabled(data?.model?.google_search ? false : true);
      useModelStore.getState().setType(data?.type || CONFIG.AI_DEFAULT_TYPE);
      promptInnerBoxEle.classList.remove("fd-state");
      aiTypeTogglerEle.classList.remove("hidden");
      last_fetch_chat_draft = chat;
    };

    if (chat?.id && last_fetch_chat_draft?.id !== chat.id) {
      getDraft();
    }
  }, [
    chat,
    setPrompt,
    setModel,
    setIsWebSearchOn,
    setIsDeepResearch,
    setIsWebSearchDisabled,
  ]);

  return null;
}

export default PromptDraftMaintainer;
