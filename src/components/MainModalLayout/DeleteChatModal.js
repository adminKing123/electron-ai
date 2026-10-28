import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import useMainModalStore from "../../store/useMainModalStore";
import { useNavigate, useParams } from "react-router-dom";
import useChatsStore from "../../store/useChatsStore";
import ROUTES from "../../router/routes";
import useMessageStore from "../../store/useMessagesStore";

const DeleteChatModal = ({ data }) => {
  const chat_id = useParams()?.id;
  const deleteChat = useChatsStore((state) => state.deleteChat);
  const setData = useMainModalStore((state) => state.setData);
  const resetMessages = useMessageStore((state) => state.resetMessages);
  const navigate = useNavigate();

  const handleDeleteChat = () => {
    close();
    deleteChat(data?.payload?.chat?.id);
    if (chat_id === data?.payload?.chat?.id) {
      resetMessages();
      navigate(ROUTES.INDEX);
    }
  };

  const close = () => setData(null);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm p-5 rounded-2xl
          bg-white dark:bg-void-825
          border border-ink-100 dark:border-void-800
          shadow-[0_16px_48px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
      >
        {/* Title */}
        <h2 className="text-[15px] font-semibold text-ink-975 dark:text-white mb-1">
          Delete chat?
        </h2>

        {/* Body */}
        <div className="mt-2 mb-5 space-y-1.5">
          <p className="text-[13px] text-ink-700 dark:text-ink-400 leading-relaxed">
            <span className="font-medium text-ink-975 dark:text-white">
              {data?.payload.chat?.title}
            </span>{" "}
            will be permanently deleted.
          </p>
          <p className="text-[12px] text-ink-400 dark:text-ink-550">
            Visit settings to delete any memories saved during this chat.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={close}
            className="px-4 py-1.5 rounded-full text-[13px] font-medium
              bg-ink-50 dark:bg-void-800
              text-ink-750 dark:text-ink-300
              hover:bg-ink-100 dark:hover:bg-void-750
              border border-ink-100 dark:border-void-750
              transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteChat}
            className="px-4 py-1.5 rounded-full text-[13px] font-medium
              bg-red-500 hover:bg-red-600
              text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default DeleteChatModal;
