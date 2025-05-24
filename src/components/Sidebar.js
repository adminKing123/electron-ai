import { TbLayoutSidebar } from "react-icons/tb";
import { SiElectron } from "react-icons/si";
import { useSidebarOpenState } from "../store/useSidebarStores";
import { useEffect } from "react";
import { IoClose } from "react-icons/io5";


const SidebarHeader = ({ toggleSidebar }) => {
  return (
    <div className="bg-[#181818] w-full h-[56px] flex items-center justify-between px-3">
      <button className="w-10 h-10 px-2 hover:bg-[#3A3A3A] rounded-lg">
        <SiElectron className="text-white w-[22px] h-[22px]" />
      </button>
      <button
        onClick={toggleSidebar}
        className="w-10 h-10 px-2 hover:bg-[#3A3A3A] rounded-lg"
      >
        <TbLayoutSidebar className="text-white w-[22px] h-[22px] hidden md:block" />
        <IoClose className="text-white w-[22px] h-[22px] block md:hidden" />
      </button>
    </div>
  );
};

const Sidebar = () => {
  const { open, setOpen } = useSidebarOpenState();

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
    <div
      className={`bg-[#171717] h-[100dvh] flex-shrink-0 overflow-hidden transition-all duration-500 absolute top-0 left-0 z-10 md:static ${
        open ? "w-[260px]" : "w-0"
      }`}
    >
      <div className="w-[260px]">
        <SidebarHeader toggleSidebar={toggleSidebar} />
      </div>
    </div>
  );
};

export default Sidebar;
