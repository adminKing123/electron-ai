import { FaPlus } from "react-icons/fa6";
import { BsSearch } from "react-icons/bs";
import { BiLibrary } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import ROUTES from "../../router/routes";

const SidebarOptionButton = ({ icon: Icon, label, ...props }) => {
  return (
    <NavLink
      className="px-[10px] py-[7px] text-[#E9E9E9] text-[13px] flex items-center gap-2 hover:bg-[#2F2F2F] rounded-lg w-full"
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
  return (
    <SidebarOptionButton icon={FaPlus} label="New chat" to={ROUTES.INDEX} />
  );
};

const SearchChatsButton = () => {
  return <SidebarOptionButton icon={BsSearch} label="Search chats" />;
};

const LibraryButton = () => {
  return <SidebarOptionButton icon={BiLibrary} label="Library" />;
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
