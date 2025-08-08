import { NavLink } from "react-router-dom";
import useChatsStore from "../../store/useChatsStore";
import { formatDateTimeV1, groupByDate } from "../../utils/helpers";
import { useEffect } from "react";
import ROUTES from "../../router/routes";
import { getChatsAPI } from "../../apis/chats/queryFunctions";
import { useSidebarOpenState } from "../../store/useSidebarStores";
import SidebarChatMenu from "./SidebarChatMenu";


const SidebarChatButton = ({ chat, ...props }) => {
  useEffect(() => {
    if (chat.is_new && chat.summarization_data) {
      useChatsStore.getState().summerizeChatTitle(chat, true);
    }
  }, [chat]);

  return (
    <NavLink
      to={ROUTES.GET_CHAT_PAGE_URL(chat.id)}
      className={({ isActive }) =>
        `${
          isActive
            ? "bg-[#EAEAEA] dark:bg-[#232323]"
            : "hover:bg-[#EFEFEF] dark:hover:bg-[#2F2F2F] active:bg-[#dbdbdb] dark:active:bg-[#232323] focus:bg-[#EAEAEA] dark:focus:bg-[#2F2F2F]"
        } group pl-[10px] dark:text-[#E9E9E9] text-[14px] flex items-center focus:outline-none rounded-lg w-full`
      }
      {...props}
    >
      <span className="truncate max-w-[200px] py-[7px] flex-grow">
        {chat.title}
      </span>
      <SidebarChatMenu chat={chat} />
    </NavLink>
  );
};

const SidebarChats = () => {
  const chats = useChatsStore((state) => state.chats);
  const setChats = useChatsStore((state) => state.setChats);
  const groupedData = groupByDate(chats, "updated_at");
  const setOpen = useSidebarOpenState((state) => state.setOpen);

  const handleChatClick = () => {
    if (window.innerWidth <= 768) {
      setOpen(false);
    }
  };

  useEffect(() => {
    const getInitialData = async () => {
      const fetchedChats = await getChatsAPI();
      setChats(fetchedChats);
    };

    getInitialData();
  }, [setChats]);

  return (
    <div className="mx-[8px] my-8">
      {Object.keys(groupedData).map((date) => (
        <div key={date} className="mt-[30px] first:mt-0">
          <h3 className="text-[14px] text-[#8F8F8F] dark:text-[#AFAFAF] px-[10px] mb-1">
            {formatDateTimeV1(date)}
          </h3>
          <div>
            {groupedData[date].map((chat) => (
              <SidebarChatButton
                key={chat.id}
                chat={chat}
                onClick={handleChatClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SidebarChats;
