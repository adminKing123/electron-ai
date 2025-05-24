import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbLayoutSidebar } from "react-icons/tb";
import { SiElectron } from "react-icons/si";

const SidebarHeader = ({ toggleSidebar }) => {
  return (
    <div className="bg-[#181818] w-full h-[56px] flex items-center justify-between px-3">
      <button className="w-10 h-10 px-2 hover:bg-[#3A3A3A] rounded-lg transition-colors duration-300">
        <SiElectron className="text-white w-[22px] h-[22px]" />
      </button>
      <button
        onClick={toggleSidebar}
        className="w-10 h-10 px-2 hover:bg-[#3A3A3A] rounded-lg transition-colors duration-300"
      >
        <TbLayoutSidebar className="text-white w-[22px] h-[22px]" />
      </button>
    </div>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="h-full">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: "fit" }}
            animate={{ width: "fit" }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-[#171717] h-full flex-shrink-0 overflow-hidden"
          >
            <div className="w-[260px]">
              <SidebarHeader toggleSidebar={toggleSidebar} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;
