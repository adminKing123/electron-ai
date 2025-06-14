import { TbLayoutSidebar } from "react-icons/tb";
import { TbGalaxy } from "react-icons/tb";
import { useSidebarOpenState } from "../store/useSidebarStores";
import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import SidebarOptions from "./SidebarOptions";
import SidebarChats from "./SidebarChats";

const SidebarOverlay = ({ open, toggleSidebar }) => {
  const shouldShow = window.innerWidth <= 768 && open;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="absolute top-0 left-0 w-screen h-[100dvh] inset-0 bg-black/50 z-10"
          onClick={toggleSidebar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </AnimatePresence>
  );
};

const SidebarHeader = ({ toggleSidebar }) => {
  return (
    <div className="bg-[#F9F9F9] dark:bg-[#181818] w-full h-[56px] flex items-center justify-between px-3 flex-shrink-0">
      <button className="w-10 h-10 px-2 hover:bg-[#EAEAEA] dark:hover:bg-[#3A3A3A] rounded-lg">
        <TbGalaxy className="text-[#000000] dark:text-white w-[22px] h-[22px]" />
      </button>
      <button
        onClick={toggleSidebar}
        className="w-10 h-10 px-2 hover:bg-[#EAEAEA] dark:hover:bg-[#3A3A3A] rounded-lg"
      >
        <TbLayoutSidebar className="text-[#8F8F8F] dark:text-white w-[22px] h-[22px] hidden md:block" />
        <IoClose className="text-[#8F8F8F] dark:text-white w-[22px] h-[22px] block md:hidden" />
      </button>
    </div>
  );
};

const Sidebar = () => {
  const open = useSidebarOpenState((state) => state.open);
  const setOpen = useSidebarOpenState((state) => state.setOpen);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setOpen]);

  return (
    <>
      <SidebarOverlay open={open} toggleSidebar={toggleSidebar} />
      <div
        className={`bg-[#F9F9F9] dark:bg-[#171717] h-[100dvh] flex-shrink-0 overflow-hidden transition-[width] duration-300 absolute top-0 left-0 z-10 md:static ${
          open ? "w-[260px]" : "w-0"
        }`}
      >
        <div className="w-[260px] h-[100dvh] flex flex-col">
          <SidebarHeader toggleSidebar={toggleSidebar} />
          <div className="flex-grow overflow-y-auto">
            <SidebarOptions />
            <SidebarChats />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
