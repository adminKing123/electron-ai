import { createPortal } from "react-dom";
import { motion } from "framer-motion";

const Modal = ({ isOpen, onClose, title, children, size = "sm" }) => {
  if (!isOpen) return null;

  const widthClass = size === "md" ? "max-w-md" : "max-w-sm";

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${widthClass} p-5 rounded-2xl
          bg-white dark:bg-[#1e1e1e]
          border border-[#e8e8e8] dark:border-[#2a2a2a]
          shadow-[0_16px_48px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)]`}
      >
        {title && (
          <h2 className="text-[15px] font-semibold text-[#111] dark:text-white mb-1">
            {title}
          </h2>
        )}
        {children}
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default Modal;
