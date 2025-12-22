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

  const handleRenameChat = async () => {
    if (!title.trim()) {
      toggleModal();
      return;
    }

    if (title === data?.payload?.chat?.title) {
      toggleModal();
      return;
    }

    setIsLoading(true);
    try {
      await renameChat(data?.payload?.chat?.id, title.trim());
      notifyRenameChatSuccess();
      toggleModal();
    } catch (error) {
      notifyRenameChatError();
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModal = () => {
    setData(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRenameChat();
    } else if (e.key === "Escape") {
      toggleModal();
    }
  };

  const animateVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return createPortal(
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={animateVariants}
      transition={{ duration: 0.1, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm top-0 left-0 w-screen h-[100dvh]"
      onClick={toggleModal}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="text-black dark:text-white bg-white dark:bg-[#2F2F2F] border border-[#eaeaea] dark:border-[#414141] rounded-2xl shadow-lg w-full max-w-md p-4"
      >
        <h2 className="text-lg">Rename Chat?</h2>
        <div className="text-base my-4">
          <p>
            This will rename <b>{data?.payload.chat?.title}</b> to:
          </p>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={data?.payload?.chat?.title || "Enter chat title"}
            autoFocus
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm rounded-xl bg-[#F7F7F7] dark:bg-[#2F2F2F] border border-[#E1E1E1] dark:border-[#4E4E4E] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex justify-end gap-3 text-sm font-semibold">
          <button
            onClick={toggleModal}
            disabled={isLoading}
            className="px-4 py-2 rounded-full dark:bg-[#2F2F2F] bg-[#ffffff] border border-[#D9D9D9] dark:border-[#4E4E4E] hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleRenameChat}
            disabled={isLoading}
            className="px-4 py-2 rounded-full text-white bg-[#000000] dark:bg-[#ffffff] dark:text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Renaming..." : "Rename"}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default RenameChatModal;
