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
    <div className="w-full h-[56px] flex items-center justify-between px-4 flex-shrink-0 border-b border-ink-100 dark:border-ink-800">
      <div className="flex items-center gap-2.5">
        <TbGalaxy className="text-ink-975 dark:text-white w-[20px] h-[20px]" />
        <span className="font-bold text-[15px] tracking-tight text-ink-975 dark:text-white">
          Comet AI
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        <NavLink
          to={ROUTES.INDEX}
          onClick={handleNewChat}
          title="New chat"
          className="w-8 h-8 flex items-center justify-center rounded-lg
            text-ink-500 dark:text-ink-600
            hover:text-ink-975 dark:hover:text-white
            hover:bg-ink-100 dark:hover:bg-ink-800
            transition-colors"
        >
          <TbEdit className="w-[17px] h-[17px]" />
        </NavLink>
        <button
          onClick={toggleSidebar}
          title="Toggle sidebar"
          className="w-8 h-8 flex items-center justify-center rounded-lg
            text-ink-500 dark:text-ink-600
            hover:text-ink-975 dark:hover:text-white
            hover:bg-ink-100 dark:hover:bg-ink-800
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
        className={`bg-ink-50 dark:bg-ink-850 h-[100dvh] flex-shrink-0 overflow-hidden transition-[width] duration-300 top-0 left-0 z-10
        ${
          mainSidebarLayoutType === "editor" ? "absolute" : "absolute md:static"
        } ${open ? "w-[288px] border-r border-ink-100 dark:border-ink-800" : "w-0"}`}
        id="sidebar"
      >
        <div className="w-[288px] h-[100dvh] flex flex-col">
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

