import { TbLayoutSidebarFilled } from "react-icons/tb";
import { useSidebarOpenState } from "../store/useSidebarStores";
import { HiMenuAlt2 } from "react-icons/hi";
import HeaderUserProfile from "./HeaderUserProfile";
import AITypeSelector from "./AITypeSelector";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

/** Shared icon-button style used across header controls */
const iconBtnCls =
  "w-8 h-8 flex items-center justify-center rounded-lg " +
  "text-[#888] dark:text-[#666] " +
  "hover:text-[#111] dark:hover:text-white " +
  "hover:bg-[#ebebeb] dark:hover:bg-[#222] " +
  "transition-colors";

const BackButton = ({ route = "" }) => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(route ? route : -1)} className={iconBtnCls}>
      <IoChevronBackOutline className="w-[18px] h-[18px]" />
    </button>
  );
};

const SidebarOpenButton = () => {
  const open = useSidebarOpenState((state) => state.open);
  const setOpen = useSidebarOpenState((state) => state.setOpen);

  if (open && window.innerWidth > 768) return null;
  return (
    <button onClick={() => setOpen(!open)} className={iconBtnCls}>
      <TbLayoutSidebarFilled className="w-[18px] h-[18px] hidden md:block" />
      <HiMenuAlt2 className="w-[18px] h-[18px] block md:hidden" />
    </button>
  );
};

/** Page-specific header labels — keyed by `type`. Falls back to "AURA". */
const PAGE_LABELS = {
  "aura-rj": "Aura RJ",
  fuse: "Fuse",
};

const Header = ({ type, backRoute = "" }) => {
  const isStandalone = type === "aura-rj" || type === "fuse";
  const label = PAGE_LABELS[type] ?? "AURA";

  return (
    <header
      id="header"
      className="h-[56px] w-full flex items-center justify-between gap-2 px-3 border-b border-[#ebebeb] dark:border-[#1e1e1e]"
    >
      <div className="flex items-center gap-1.5">
        {isStandalone ? <BackButton route={backRoute} /> : <SidebarOpenButton />}
        <span className="text-[14px] font-semibold tracking-tight text-[#111] dark:text-white select-none">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {type === "chat" ? <AITypeSelector /> : null}
        <HeaderUserProfile />
      </div>
    </header>
  );
};

export default Header;
