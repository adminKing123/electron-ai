import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import useMainModalStore from "../../store/useMainModalStore";
import AppCard from "./ConnectAppsComponents/AppCard";
import { AVAILABLE_APPS } from "../../constants/connectedApps";

const ConnectAppsModal = () => {
  const setData = useMainModalStore((state) => state.setData);

  const closeModal = () => {
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
      onClick={closeModal}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="text-black dark:text-white bg-white dark:bg-[#2F2F2F] border border-[#eaeaea] dark:border-[#414141] rounded-2xl shadow-lg w-full max-w-2xl mx-4 p-4 sm:p-6 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Connect Apps</h2>
          <button
            onClick={closeModal}
            className="text-[#838383] hover:text-black dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#838383] dark:text-[#C8C8C8] mb-4 sm:mb-6">
          Connect your apps to enhance your experience. Your data is secure and you can disconnect anytime.
        </p>

        <div className="space-y-3">
          {AVAILABLE_APPS.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default ConnectAppsModal;
