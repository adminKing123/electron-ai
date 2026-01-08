import { TbLayoutSidebarFilled } from "react-icons/tb";
import { useSidebarOpenState } from "../store/useSidebarStores";
import { HiMenuAlt2 } from "react-icons/hi";
import HeaderUserProfile from "./HeaderUserProfile";
import AITypeSelector from "./AITypeSelector";

const SidebarOpenButton = () => {
  const open = useSidebarOpenState((state) => state.open);
  const setOpen = useSidebarOpenState((state) => state.setOpen);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  if (open && window.innerWidth > 768) return null;
  return (
    <button
      onClick={toggleSidebar}
      className="w-10 h-10 px-2 hover:bg-[#EAEAEA] dark:hover:bg-[#3A3A3A] rounded-lg"
    >
      <TbLayoutSidebarFilled className="text-[#666666] dark:text-white w-[24px] h-[24px] hidden md:block" />
      <HiMenuAlt2 className="text-[#666666] dark:text-white w-[24px] h-[24px] block md:hidden" />
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
        <button className="text-xl text-black dark:text-white font-semibold p-2 rounded-lg">
          Electron AI
        </button>
      </div>
      <div className="flex items-center gap-5">
        <AITypeSelector />
        <HeaderUserProfile />
      </div>
    </header>
  );
};

export default Header;
