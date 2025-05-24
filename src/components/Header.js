import { useEffect } from "react";
import { TbLayoutSidebarFilled } from "react-icons/tb";
import { useSidebarOpenState } from "../store/useSidebarStores";

const SidebarOpenButton = () => {
  const { open, setOpen } = useSidebarOpenState();

  const toggleSidebar = () => {
    setOpen(!open);
  };

  if (open) return null;
  return (
    <button
      onClick={toggleSidebar}
      className="w-10 h-10 px-2 hover:bg-[#3A3A3A] rounded-lg"
    >
      <TbLayoutSidebarFilled className="text-white w-[22px] h-[22px]" />
    </button>
  );
};

const Header = () => {
  useEffect(() => {
    const container = document.getElementById("messages-container");
    const header = document.getElementById("header");
    const handleScroll = () => {
      if (container.scrollTop > 0) {
        header.classList.add("header-shadow");
      } else {
        header.classList.remove("header-shadow");
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);
  return (
    <header
      id="header"
      className="h-[56px] w-full flex items-center justify-between gap-2 px-3"
    >
      <div className="flex items-center">
        <SidebarOpenButton />
        <button className="text-xl text-white font-semibold py-1.5 px-3 hover:bg-[#3A3A3A] rounded-lg">
          ElectronAI
        </button>
      </div>
    </header>
  );
};

export default Header;
