import { useEffect } from "react";
import usePromptStore, {
  useDeepResearchStore,
  useModelStore,
  useWebSearchStore,
} from "../../store/usePromptStores";
import debounce from "lodash.debounce";
import { saveDraftAPI } from "../../apis/chats/queryFunctions";

const handlePromptChange = debounce((chat, data) => {
    if (chat?.is_new) return;
    else saveDraftAPI(chat, data);
}, 300);

function PromptDraftMaintainer({ chat }) {
  const { prompt } = usePromptStore();
  const { model } = useModelStore();
  const { isWebSearchOn } = useWebSearchStore();
  const { isDeepResearch } = useDeepResearchStore();

  useEffect(() => {
    handlePromptChange(chat, {
      prompt: prompt,
      model: model,
      isWebSearchOn: isWebSearchOn,
      isDeepResearch: isDeepResearch,
    });
  }, [chat, prompt, model, isWebSearchOn, isDeepResearch]);

  return null;
}

export default PromptDraftMaintainer;
