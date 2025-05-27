import { NavLink } from "react-router-dom";
import { SlOptions } from "react-icons/sl";
import useChatsStore from "../../store/useChatsStore";
import { formatDateTimeV1, groupByDate } from "../../utils/helpers";

const SidebarChatButton = ({ chat, handleMenuButtonClick }) => {
  return (
    <NavLink
      to={`/${chat.id}`}
      className="group pl-[10px] text-[#E9E9E9] text-[13px] flex items-center hover:bg-[#2F2F2F] rounded-lg w-full"
    >
      <span className="truncate max-w-[200px] py-[7px]">{chat.title}</span>
      <button
        type="button"
        onClick={handleMenuButtonClick}
        className="flex-shrink-0 py-[7px] px-[10px] hidden group-hover:block"
      >
        <SlOptions />
      </button>
    </NavLink>
  );
};

const SidebarChats = () => {
  const { chats } = useChatsStore();
  const groupedData = groupByDate(chats, "updated_at");

  const handleMenuButtonClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Menu button clicked for chat:", e.currentTarget);
  };

  return (
    <div className="mx-[8px] my-8">
      {Object.keys(groupedData).map((date) => (
        <div key={date} className="mt-[30px] first:mt-0">
          <h3 className="text-[13px] text-[#AFAFAF] px-[10px] mb-1">
            {formatDateTimeV1(date)}
          </h3>
          <div>
            {groupedData[date].map((chat) => (
              <SidebarChatButton
                key={chat.id}
                chat={chat}
                handleMenuButtonClick={handleMenuButtonClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SidebarChats;
