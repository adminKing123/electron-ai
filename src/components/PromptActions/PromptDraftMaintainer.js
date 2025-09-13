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
  const { isWebSearchOn, setIsWebSearchOn } = useWebSearchStore();
  const { isDeepResearch, setIsDeepResearch } = useDeepResearchStore();

  useEffect(() => {
    if (chat?.id && last_fetch_chat_draft?.id === chat.id) {
      handlePromptChange(chat, {
        prompt: prompt,
        model: model,
        isWebSearchOn: isWebSearchOn,
        isDeepResearch: isDeepResearch,
      });
    }
  }, [chat, prompt, model, isWebSearchOn, isDeepResearch]);

  useEffect(() => {
    const getDraft = async () => {
      const data = await getDraftAPI(
        chat?.is_new ? CONFIG.NEW_CHAT_DRAFT_ID : chat.id
      );
      if (data) {
        setPrompt(data?.prompt || "");
        setModel(data?.model || null);
        setIsWebSearchOn(data?.isWebSearchOn || false);
        setIsDeepResearch(data?.isDeepResearch || false);
      }
      last_fetch_chat_draft = chat;
    };

    if (chat?.id && last_fetch_chat_draft?.id !== chat.id) {
      getDraft();
    }
  }, [chat, setPrompt, setModel, setIsWebSearchOn, setIsDeepResearch]);

  return null;
}

export default PromptDraftMaintainer;
