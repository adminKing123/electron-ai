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

  if (
    !action?.type === CONFIG.PROMPT_ACTION_TYPES.EDIT &&
    prompt.length > CONFIG.MAX_PROMPT_LENGTH
  ) {
    notifyTextAreaLimitReached();
    return;
  }
  if (!action?.type === CONFIG.PROMPT_ACTION_TYPES.EDIT && isPromptSendDisabled)
    return;

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
    } else if (action?.type === CONFIG.PROMPT_ACTION_TYPES.INTERRUPT_CONTINUE) {
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
    navigate?.(ROUTES.GET_CHAT_PAGE_URL(chat.id), {
      state: { chat: { ...chat, is_new: false, shouldAutoFocus: false } },
    });
  };

  let payload = null;

  if (action?.type === CONFIG.PROMPT_ACTION_TYPES.EDIT) {
    const oldMessge = getMessage(action.data.message_id);
    payload = {
      prompt,
      answer: [],
      sources: [],
      answer_files: [],
      steps: [],
      model: model,
      google_search,
      generate_image,
      created_at: oldMessge.created_at,
      updated_at: new Date().toISOString(),
      interrupt: {},
      files: files.map((file) => ({
        file_id: file.file_id,
        user_id: file.user_id,
        original_name: file.original_name,
        filename: file.filename,
        file_type: file.file_type,
        download_url: file.download_url,
        size: file.size,
      })),
    };
    id = setMessage(action.data.message_id, payload);
  } else if (action?.type === CONFIG.PROMPT_ACTION_TYPES.INTERRUPT_CONTINUE) {
    const oldMessge = getMessage(action.data.message_id);
    payload = {
      ...oldMessge,
      interrupt: {},
    };
    id = setMessage(action.data.message_id, payload);
  } else {
    payload = {
      prompt,
      answer: [],
      sources: [],
      answer_files: [],
      steps: [],
      model: model,
      google_search,
      generate_image,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
    };
    id = addMessage(payload);
    payload.id = id;
  }

  if (chat.is_new) {
    handleNewChatEntered(chat, {
      prompt_to_summerize_title: prompt,
    });
  }

  const payloadToSend = {
    id: id,
    chat_id: chat.id,
    prompt: payload.prompt,
    model: payload.model,
    google_search: payload.google_search,
    generate_image: payload.generate_image,
    created_at: payload.created_at,
    updated_at: payload.updated_at,
    files: payload.files,
    interrupt: payload.interrupt,
    descisions: action?.data?.descisions || undefined,
    deep_research: useDeepResearchStore.getState().isDeepResearch,
  };

  handleStream(
    payload.id,
    payloadToSend,
    onProgress,
    onStart,
    onEnd,
    onError
  );
  setPrompt("");
  clearFilesFromInputBox();
};
