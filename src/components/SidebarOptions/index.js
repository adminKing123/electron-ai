import { FaPlus } from "react-icons/fa6";
import { BsSearch } from "react-icons/bs";
import { BiLibrary } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import ROUTES from "../../router/routes";
import { useSidebarOpenState } from "../../store/useSidebarStores";
import useMessageStore from "../../store/useMessagesStore";

/* Shared item style used by every option row */
const itemBase =
  "flex items-center gap-2.5 w-full rounded-lg px-3 py-[7px] text-[13px] font-medium text-ink-750 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors duration-100 outline-none";

const SidebarNavLink = ({ icon: Icon, label, showActiveState, ...props }) => (
  <NavLink
    className={({ isActive }) =>
      itemBase +
      (showActiveState && isActive ? " bg-brand-500/10 dark:bg-brand-400/15 !text-brand-700 dark:!text-brand-200" : "")
    }
    {...props}
  >
    <Icon className="w-4 h-4 flex-shrink-0 opacity-50" />
    <span>{label}</span>
  </NavLink>
);

const CreateNewChatButton = () => {
  const setOpen = useSidebarOpenState((state) => state.setOpen);
  const resetMessages = useMessageStore((state) => state.resetMessages);
  return (
    <SidebarNavLink
      icon={FaPlus}
      label="New chat"
      to={ROUTES.INDEX}
      onClick={() => {
        resetMessages();
        if (window.innerWidth <= 768) setOpen(false);
      }}
    />
  );
};

const SearchChatsButton = () => <SidebarNavLink icon={BsSearch} label="Search" />;

const LibraryButton = () => {
  const setOpen = useSidebarOpenState((state) => state.setOpen);
  const resetMessages = useMessageStore((state) => state.resetMessages);
  return (
    <SidebarNavLink
      icon={BiLibrary}
      label="Library"
      to={ROUTES.LIBRARY}
      showActiveState
      onClick={() => {
        resetMessages();
        if (window.innerWidth <= 768) setOpen(false);
      }}
    />
  );
};

const SidebarOptions = () => (
  <div className="px-2 pt-3 pb-1 flex flex-col gap-0.5">
    <CreateNewChatButton />
    <SearchChatsButton />
    <LibraryButton />
  </div>
);

export default SidebarOptions;

