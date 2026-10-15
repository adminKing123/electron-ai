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
        `group relative flex items-center w-full min-w-0 rounded-lg text-[13px] font-medium
        transition-colors duration-100 outline-none
        text-[#333] dark:text-[#ccc]
        ${
          isActive
            ? "bg-[#e6e6e6] dark:bg-[#242424] text-[#111] dark:text-white"
            : "hover:bg-[#ebebeb] dark:hover:bg-[#222]"
        }`
      }
      {...props}
    >
      <span
        className="min-w-0 flex-1 truncate px-3 py-[7px] pr-3
          transition-[padding] duration-100
          group-hover:pr-9 group-has-[[data-state=open]]:pr-9"
      >
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
  }, [
    hasMore,
    isLoading,
    lastDoc,
    appendChats,
    setLastDoc,
    setHasMore,
    setIsLoading,
  ]);

  const handleScroll = useCallback(() => {
    const container = document.getElementById("sidebar-scroll-container");
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollThreshold = CONFIG.CHATS_SCROLL_THRESHOLD;

    if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
      loadMoreChats();
    }
  }, [loadMoreChats]);

  useEffect(() => {
    const container = document.getElementById("sidebar-scroll-container");
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="px-2 pb-6">
      {Object.keys(groupedData).map((date) => (
        <div key={date} className="mt-4 first:mt-2">
          <p className="text-[11px] text-[#aaa] dark:text-[#555] px-3 mb-1">
            {formatDateTimeV1(date)}
          </p>
          <div className="flex flex-col gap-px">
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
    </div>
  );
};

export default SidebarChats;
