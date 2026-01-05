import { v4 as uuidv4 } from "uuid";
import useMessageStore, {
  useProcessController,
} from "../store/useMessagesStore";
import { scrollToMessage, scrollToMessageTop } from "./helpers";
import handleStream from "../apis/prompt_generation/handleStream";
import usePromptStore, {
  useDeepResearchStore,
  useFileInputStore,
  useMicStore,
  useModelStore,
  useWebSearchStore,
} from "../store/usePromptStores";
import useChatsStore from "../store/useChatsStore";
import ROUTES from "../router/routes";
import { createMessageAPI } from "../apis/messages/queryFunctions";
import CONFIG from "../config";
import { notifyTextAreaLimitReached } from "./notifier";
import { removeDraftAPI } from "../apis/chats/queryFunctions";

export const handleSend = (chat, navigate) => {
  const { prompt, setPrompt, action } = usePromptStore.getState();
  const { model } = useModelStore.getState();
  const { process } = useProcessController.getState();
  const { isWebSearchDisabled, isWebSearchOn } = useWebSearchStore.getState();
  const { clearFiles: clearFilesFromInputBox, attachedFiles } =
    useFileInputStore.getState();
  const { isRecording } = useMicStore.getState();

  const files = Object.values(attachedFiles);
  const any_file_uploading = files.some((file) =>
    file?.in_progress ? true : false
  );

  const isPromptSendDisabled =
    process || !prompt.trim() || model === null
      ? true
      : false || any_file_uploading || isRecording;

  if (prompt.length > CONFIG.MAX_PROMPT_LENGTH) {
    notifyTextAreaLimitReached();
    return;
  }
  if (isPromptSendDisabled) return;

  const google_search = isWebSearchDisabled ? false : isWebSearchOn;
  const generate_image = false;

  let id = null;

  const getMessage = useMessageStore.getState().getMessage;
  const setMessage = useMessageStore.getState().setMessage;
  const addMessage = useMessageStore.getState().addMessage;
  const addChunkInMessageAnswer =
    useMessageStore.getState().addChunkInMessageAnswer;

  const onProgress = (data) => {
    addChunkInMessageAnswer(data.id, data.event);
  };

  const onStart = (data) => {
    const { action, setAction } = usePromptStore.getState();
    if (action?.type === CONFIG.PROMPT_ACTION_TYPES.EDIT) {
      scrollToMessageTop(action.data.message_id);
      setAction({});
    } else {
      scrollToMessage(data.id);
    }
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
    removeDraftAPI({ id: CONFIG.NEW_CHAT_DRAFT_ID });
    navigate(ROUTES.GET_CHAT_PAGE_URL(chat.id), {
      state: { chat: { ...chat, is_new: false, shouldAutoFocus: false } },
    });
  };

  if (action?.type === CONFIG.PROMPT_ACTION_TYPES.EDIT) {
    const oldMessge = getMessage(action.data.message_id);
    id = setMessage(action.data.message_id, {
      prompt,
      answer: [],
      sources: [],
      answer_files: [],
      steps: [],
      model: model,
      google_search,
      generate_image,
      created_at: oldMessge.created_at,
      updated_at: new Date(),
      interrupt: {},
    });
  } else {
    id = addMessage({
      prompt,
      answer: [],
      sources: [],
      answer_files: [],
      steps: [],
      model: model,
      google_search,
      generate_image,
      created_at: new Date(),
      updated_at: new Date(),
      files: files.map((file) => ({
        file_id: file.file_id,
        user_id: file.user_id,
        original_name: file.original_name,
        filename: file.filename,
        file_type: file.file_type,
        download_url: file.download_url,
        size: file.size,
      })),
      interrupt: {},
    });
  }

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
      deep_research: useDeepResearchStore.getState().isDeepResearch,
    },
    onProgress,
    onStart,
    onEnd,
    onError
  );
  setPrompt("");
  clearFilesFromInputBox();
};
