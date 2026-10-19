import { TbLayoutSidebar, TbEdit } from "react-icons/tb";
import { TbGalaxy } from "react-icons/tb";
import { useSidebarOpenState } from "../store/useSidebarStores";
import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import SidebarOptions from "./SidebarOptions";
import SidebarChats from "./SidebarChats";
import useMainSideLayoutStore from "../store/useMainSideLayoutStore";
import { NavLink } from "react-router-dom";
import ROUTES from "../router/routes";
import useMessageStore from "../store/useMessagesStore";

const SidebarOverlay = ({ open, toggleSidebar }) => {
  const mainSidebarLayoutType = useMainSideLayoutStore(
    (state) => state.data?.type
  );
  const shouldShow =
    (window.innerWidth <= 768 || mainSidebarLayoutType === "editor") && open;

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
  const resetMessages = useMessageStore((state) => state.resetMessages);
  const setOpen = useSidebarOpenState((state) => state.setOpen);

  const handleNewChat = () => {
    resetMessages();
    if (window.innerWidth <= 768) setOpen(false);
  };

  return (
    <div className="w-full h-[56px] flex items-center justify-between px-4 flex-shrink-0 border-b border-[#ebebeb] dark:border-[#232323]">
      <div className="flex items-center gap-2.5">
        <TbGalaxy className="text-[#111] dark:text-white w-[18px] h-[18px]" />
        <span className="font-semibold text-[14px] text-[#111] dark:text-white tracking-tight">
          Comet AI
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        <NavLink
          to={ROUTES.INDEX}
          onClick={handleNewChat}
          title="New chat"
          className="w-8 h-8 flex items-center justify-center rounded-lg
            text-[#888] dark:text-[#666]
            hover:text-[#111] dark:hover:text-[#fff]
            hover:bg-[#ebebeb] dark:hover:bg-[#242424]
            transition-colors"
        >
          <TbEdit className="w-[17px] h-[17px]" />
        </NavLink>
        <button
          onClick={toggleSidebar}
          title="Toggle sidebar"
          className="w-8 h-8 flex items-center justify-center rounded-lg
            text-[#888] dark:text-[#666]
            hover:text-[#111] dark:hover:text-[#fff]
            hover:bg-[#ebebeb] dark:hover:bg-[#242424]
            transition-colors"
        >
          <TbLayoutSidebar className="w-[17px] h-[17px] hidden md:block" />
          <IoClose className="w-[17px] h-[17px] block md:hidden" />
        </button>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const mainSidebarLayoutType = useMainSideLayoutStore(
    (state) => state.data?.type
  );
  const open = useSidebarOpenState((state) => state.open);
  const setOpen = useSidebarOpenState((state) => state.setOpen);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth > 768 && !mainSidebarLayoutType === "editor");
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setOpen, mainSidebarLayoutType]);

  return (
    <>
      <SidebarOverlay open={open} toggleSidebar={toggleSidebar} />
      <div
        className={`bg-[#F9F9F9] dark:bg-[#171717] h-[100dvh] flex-shrink-0 overflow-hidden transition-[width] duration-300 top-0 left-0 z-10
        ${
          mainSidebarLayoutType === "editor" ? "absolute" : "absolute md:static"
        } ${open ? "w-[260px]" : "w-0"}`}
        id="sidebar"
      >
        <div className="w-[260px] h-[100dvh] flex flex-col">
          <SidebarHeader toggleSidebar={toggleSidebar} />
          <div className="flex-grow overflow-y-auto" id="sidebar-scroll-container">
            <SidebarOptions />
            <SidebarChats />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

