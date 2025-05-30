import { TbLayoutSidebarFilled } from "react-icons/tb";
import { useSidebarOpenState } from "../store/useSidebarStores";
import { HiMenuAlt2 } from "react-icons/hi";
import HeaderUserProfile from "./HeaderUserProfile";

const SidebarOpenButton = () => {
  const { open, setOpen } = useSidebarOpenState();

  const toggleSidebar = () => {
    setOpen(!open);
  };

  if (open && window.innerWidth > 768) return null;
  return (
    <button
      onClick={toggleSidebar}
      className="w-10 h-10 px-2 hover:bg-[#3A3A3A] rounded-lg"
    >
      <TbLayoutSidebarFilled className="text-white w-[22px] h-[22px] hidden md:block" />
      <HiMenuAlt2 className="text-white w-[22px] h-[22px] block md:hidden" />
    </button>
  );
};

const Header = () => {
  return (
    <header
      id="header"
      className="h-[56px] w-full flex items-center justify-between gap-2 px-3 mb-[1px]"
    >
      <div className="flex items-center">
        <SidebarOpenButton />
        <button className="text-xl text-black dark:text-white font-semibold py-1.5 px-3 hover:bg-[#F9F9F9] dark:hover:bg-[#3A3A3A] rounded-lg">
          ElectronAI
        </button>
      </div>
      <div className="flex items-center">
        <HeaderUserProfile />
      </div>
    </header>
  );
};

export default Header;
