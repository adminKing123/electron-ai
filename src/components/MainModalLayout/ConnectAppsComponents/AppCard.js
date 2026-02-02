import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronDown } from "react-icons/io5";
import useConnectedAppsStore from "../../../store/useConnectedAppsStore";
import ConnectedAppAccordion from "./ConnectedAppAccordion";
import { connectApp, disconnectApp } from "../../../utils/connectedAppsAuth";

const AppCard = ({ app }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const connectedApps = useConnectedAppsStore((state) => state.connectedApps);
  const isConnected = connectedApps[app.id]?.isConnected || false;

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connectApp(app);
    } catch (error) {
      console.error("Failed to connect app:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await disconnectApp(app.id);
    } catch (error) {
      console.error("Failed to disconnect app:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <ConnectedAppAccordion
        app={app}
        onDisconnect={handleDisconnect}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="border border-[#E6E6E6] dark:border-[#414141] rounded-xl p-3 sm:p-4 hover:border-[#D0D0D0] dark:hover:border-[#525252] transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#F5F5F5] to-[#E5E5E5] dark:from-[#3A3A3A] dark:to-[#2F2F2F] flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
            {app.icon}
          </div>
          <h3 className="font-semibold text-sm sm:text-base truncate">{app.name}</h3>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoading ? "Connecting..." : "Connect"}
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8 rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3A] flex items-center justify-center transition-colors"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-lg text-[#838383] dark:text-[#C8C8C8]"
            >
              <IoChevronDown />
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-[#E6E6E6] dark:border-[#414141]">
              <p className="text-xs sm:text-sm text-[#838383] dark:text-[#C8C8C8] mb-3">
                {app.description}
              </p>
              
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="text-xs sm:text-sm font-semibold">Data access:</h4>
                {app.dataTypes.map((dataType, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs sm:text-sm text-[#666666] dark:text-[#C8C8C8]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#838383] flex-shrink-0" />
                    <span>{dataType}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppCard;
