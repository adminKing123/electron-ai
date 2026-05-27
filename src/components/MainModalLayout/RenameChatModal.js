import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import useMainModalStore from "../../store/useMainModalStore";
import useChatsStore from "../../store/useChatsStore";
import { notifyRenameChatSuccess, notifyRenameChatError } from "../../utils/notifier";

const RenameChatModal = ({ data }) => {
  const [title, setTitle] = useState(data?.payload?.chat?.title || "");
  const [isLoading, setIsLoading] = useState(false);
  const renameChat = useChatsStore((state) => state.renameChat);
  const setData = useMainModalStore((state) => state.setData);

  const close = () => setData(null);

  const handleRenameChat = async () => {
    if (!title.trim() || title === data?.payload?.chat?.title) {
      close();
      return;
    }
    setIsLoading(true);
    try {
      await renameChat(data?.payload?.chat?.id, title.trim());
      notifyRenameChatSuccess();
      close();
    } catch (error) {
      notifyRenameChatError();
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRenameChat();
    } else if (e.key === "Escape") {
      close();
    }
  };

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
          bg-white dark:bg-[#1e1e1e]
          border border-[#e8e8e8] dark:border-[#2a2a2a]
          shadow-[0_16px_48px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
      >
        {/* Title */}
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-white mb-1">
          Rename chat
        </h2>
        <p className="text-[12px] text-[#aaa] dark:text-[#555] mb-4">
          Current: {data?.payload.chat?.title}
        </p>

        {/* Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter new name…"
          autoFocus
          disabled={isLoading}
          className="w-full px-3.5 py-2.5 mb-5 text-[13px] rounded-xl
            bg-[#f5f5f5] dark:bg-[#252525]
            border border-[#e8e8e8] dark:border-[#2a2a2a]
            text-[#111] dark:text-white
            placeholder:text-[#bbb] dark:placeholder:text-[#444]
            focus:outline-none focus:border-[#ccc] dark:focus:border-[#444]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={close}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-full text-[13px] font-medium
              bg-[#f4f4f4] dark:bg-[#2a2a2a]
              text-[#333] dark:text-[#ccc]
              hover:bg-[#ebebeb] dark:hover:bg-[#333]
              border border-[#e8e8e8] dark:border-[#333]
              transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleRenameChat}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-full text-[13px] font-medium
              bg-[#111] dark:bg-white
              text-white dark:text-[#111]
              hover:opacity-85 transition-opacity
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Renaming…" : "Rename"}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default RenameChatModal;
