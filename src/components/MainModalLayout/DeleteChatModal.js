import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import useMainModalStore from "../../store/useMainModalStore";

const DeleteChatModal = ({ data }) => {
  const setData = useMainModalStore((state) => state.setData);

  const handleDeleteChat = () => {
    toggleSideLayout();
  };

  const toggleSideLayout = () => {
    setData(null);
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
    >
      <motion.div className="text-black dark:text-white bg-white dark:bg-[#2F2F2F] border border-[#eaeaea] dark:border-[#414141] rounded-2xl shadow-lg w-full max-w-md p-4">
        <h2 className="text-lg">Delete Chat?</h2>
        <div className="text-base my-4">
          <p>
            This will delete <b>{data?.payload.chat?.title}.</b>
          </p>
          <p className="text-sm text-[#AFAFAF] mt-2">
            Visit{" "}
            <u>
              <a href="#settings/Personalization">settings</a>
            </u>{" "}
            to delete any memories saved during this chat.
          </p>
        </div>
        <div className="flex justify-end gap-3 text-sm font-semibold">
          <button
            onClick={toggleSideLayout}
            className="px-4 py-2 rounded-full dark:bg-[#2F2F2F] bg-[#ffffff] border border-[#D9D9D9] dark:border-[#4E4E4E]"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteChat}
            className="px-4 py-2 rounded-full text-white bg-[#E02E2A]"
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
