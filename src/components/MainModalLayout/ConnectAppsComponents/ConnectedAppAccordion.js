import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronDown } from "react-icons/io5";
import useConnectedAppsStore from "../../../store/useConnectedAppsStore";

const ConnectedAppAccordion = ({ app, onDisconnect, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const connectedApps = useConnectedAppsStore((state) => state.connectedApps);
  const appData = connectedApps[app.id];

  return (
    <div className="border border-[#4CAF50] dark:border-[#4CAF50] rounded-xl p-3 sm:p-4 bg-[#F1F8F4] dark:bg-[#1A2F1E]">
      <div className="flex items-start justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-start gap-2 sm:gap-3 flex-1 text-left"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#F5F5F5] to-[#E5E5E5] dark:from-[#3A3A3A] dark:to-[#2F2F2F] flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
            {app.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3 className="font-semibold text-sm sm:text-base">{app.name}</h3>
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-[#4CAF50] text-white">
                Connected
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#838383] dark:text-[#C8C8C8] mt-1">
              {app.description}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-lg sm:text-xl text-[#838383] dark:text-[#C8C8C8] mt-1 flex-shrink-0"
          >
            <IoChevronDown />
          </motion.div>
        </button>
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
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E6E6E6] dark:border-[#414141]">
              <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Data we're accessing:</h4>
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                {app.dataTypes.map((dataType, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs sm:text-sm text-[#666666] dark:text-[#C8C8C8]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] flex-shrink-0" />
                    <span>{dataType}</span>
                  </div>
                ))}
              </div>

              {appData?.lastSync && (
                <p className="text-[10px] sm:text-xs text-[#838383] dark:text-[#C8C8C8] mb-3 sm:mb-4">
                  Last synced: {new Date(appData.lastSync).toLocaleString()}
                </p>
              )}

              <button
                onClick={onDisconnect}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-full border border-[#E02E2A] text-[#E02E2A] text-xs sm:text-sm font-medium hover:bg-[#E02E2A] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectedAppAccordion;
