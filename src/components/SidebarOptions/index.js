import { FaPlus } from "react-icons/fa6";
import { BsSearch } from "react-icons/bs";
import { BiLibrary } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import ROUTES from "../../router/routes";
import { useSidebarOpenState } from "../../store/useSidebarStores";
import useMessageStore from "../../store/useMessagesStore";

const SidebarOptionButton = ({
  icon: Icon,
  label,
  showActiveState,
  ...props
}) => {
  return (
    <NavLink
      className={({ isActive }) =>
        `px-[10px] py-[7px] text-[#000000] dark:text-[#E9E9E9] text-[14px] flex items-center gap-2 hover:bg-[#EFEFEF] dark:hover:bg-[#2F2F2F] active:bg-[#dbdbdb] dark:active:bg-[#232323] rounded-lg w-full` +
        (showActiveState && isActive
          ? " bg-[#EFEFEF] dark:bg-[#232323]"
          : "")
      }
      {...props}
    >
      <span>
        <Icon />
      </span>
      <span>{label}</span>
    </NavLink>
  );
};

const CreateNewChatButton = () => {
  const setOpen = useSidebarOpenState((state) => state.setOpen);
  const resetMessages = useMessageStore((state) => state.resetMessages);

  const handleClick = () => {
    resetMessages();
    if (window.innerWidth <= 768) {
      setOpen(false);
    }
  };

  return (
    <SidebarOptionButton
      icon={FaPlus}
      label="New chat"
      to={ROUTES.INDEX}
      onClick={handleClick}
    />
  );
};

const SearchChatsButton = () => {
  return <SidebarOptionButton icon={BsSearch} label="Search chats" />;
};

const LibraryButton = () => {
  return (
    <SidebarOptionButton
      icon={BiLibrary}
      label="Library"
      to={ROUTES.LIBRARY}
      showActiveState
    />
  );
};

const SidebarOptions = () => {
  return (
    <div className="my-2 mx-[8px]">
      <CreateNewChatButton />
      <SearchChatsButton />
      <LibraryButton />
    </div>
  );
};

export default SidebarOptions;
