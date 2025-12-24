import { NavLink } from "react-router-dom";
import useChatsStore from "../../store/useChatsStore";
import { formatDateTimeV1, groupByDate } from "../../utils/helpers";
import { useEffect, useRef, useCallback } from "react";
import ROUTES from "../../router/routes";
import { getChatsAPI } from "../../apis/chats/queryFunctions";
import { useSidebarOpenState } from "../../store/useSidebarStores";
import SidebarChatMenu from "./SidebarChatMenu";
import CONFIG from "../../config";


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
  const appendChats = useChatsStore((state) => state.appendChats);
  const lastDoc = useChatsStore((state) => state.lastDoc);
  const hasMore = useChatsStore((state) => state.hasMore);
  const isLoading = useChatsStore((state) => state.isLoading);
  const setLastDoc = useChatsStore((state) => state.setLastDoc);
  const setHasMore = useChatsStore((state) => state.setHasMore);
  const setIsLoading = useChatsStore((state) => state.setIsLoading);
  
  const groupedData = groupByDate(chats, "updated_at");
  const setOpen = useSidebarOpenState((state) => state.setOpen);
  const loadingRef = useRef(false);

  const handleChatClick = () => {
    if (window.innerWidth <= 768) {
      setOpen(false);
    }
  };

  // Load initial chats
  useEffect(() => {
    const getInitialData = async () => {
      setIsLoading(true);
      try {
        const fetchedChats = await getChatsAPI();
        setChats(fetchedChats);
        
        if (fetchedChats.length > 0) {
          const lastVisible = fetchedChats[fetchedChats.length - 1].docRef;
          setLastDoc(lastVisible);
          setHasMore(fetchedChats.length === CONFIG.CHATS_PAGE_SIZE);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading chats:", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialData();
  }, [setChats, setLastDoc, setHasMore, setIsLoading]);

  // Load more chats
  const loadMoreChats = useCallback(async () => {
    if (!hasMore || isLoading || loadingRef.current || !lastDoc) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const moreChats = await getChatsAPI(lastDoc);
      
      if (moreChats.length > 0) {
        appendChats(moreChats);
        const newLastDoc = moreChats[moreChats.length - 1].docRef;
        setLastDoc(newLastDoc);
        setHasMore(moreChats.length === CONFIG.CHATS_PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more chats:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [hasMore, isLoading, lastDoc, appendChats, setLastDoc, setHasMore, setIsLoading]);

  // Handle scroll event
  const handleScroll = useCallback(() => {
    const container = document.getElementById("sidebar-scroll-container");
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollThreshold = CONFIG.CHATS_SCROLL_THRESHOLD;

    if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
      loadMoreChats();
    }
  }, [loadMoreChats]);

  // Attach scroll listener
  useEffect(() => {
    const container = document.getElementById("sidebar-scroll-container");
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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
      
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-3 h-3 border-2 border-t-transparent border-black dark:border-t-transparent dark:border-white rounded-full animate-spin"></div>
        </div>
      )}
      
      {!isLoading && chats.length === 0 && (
        <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
          No chats yet
        </div>
      )}
    </div>
  );
};

export default SidebarChats;
