import { TbLayoutSidebar } from "react-icons/tb";
import { SiElectron } from "react-icons/si";
import { useSidebarOpenState } from "../store/useSidebarStores";

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
        <TbLayoutSidebar className="text-white w-[22px] h-[22px]" />
      </button>
    </div>
  );
};

const Sidebar = () => {
  const { open, setOpen } = useSidebarOpenState();

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <div className="h-full">
      <div
        className={`bg-[#171717] h-full flex-shrink-0 overflow-hidden transition-all duration-500 ${
          open ? "w-[260px]" : "w-0"
        }`}
      >
        <div className="w-[260px]">
          <SidebarHeader toggleSidebar={toggleSidebar} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
