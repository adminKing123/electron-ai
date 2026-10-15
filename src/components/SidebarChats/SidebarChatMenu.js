import { SlOptions } from "react-icons/sl";
import { AiOutlineDelete } from "react-icons/ai";
import { PiShareBold } from "react-icons/pi";
import { FiEdit2 } from "react-icons/fi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import DropdownMenuButton from "../Dropdown/DropdownMenuButton";
import useMainModalStore from "../../store/useMainModalStore";

const SidebarChatMenu = ({ chat }) => {
  const setData = useMainModalStore((state) => state.setData);

  const handleClick = (e) => {
    e.stopPropagation();
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setData({
      type: "rename_chat",
      payload: { chat },
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setData({
      type: "delete_chat",
      payload: { chat },
    });
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className="absolute right-1 top-1/2 z-[1] -translate-y-1/2
            flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md
            opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100
            text-[#888] dark:text-[#666]
            hover:text-[#111] dark:hover:text-white
            transition-opacity"
        >
          <SlOptions className="w-[11px] h-[11px]" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          align="start"
          className="min-w-[150px] p-1 rounded-xl z-50
            bg-white dark:bg-[#252525]
            border border-[#e8e8e8] dark:border-[#2e2e2e]
            shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        >
          <DropdownMenuButton onClick={handleClick} icon={PiShareBold} label="Share" />
          <DropdownMenuButton onClick={handleRename} icon={FiEdit2} label="Rename" />
          <DropdownMenu.Separator className="h-px my-1 bg-[#ebebeb] dark:bg-[#2e2e2e]" />
          <DropdownMenuButton
            onClick={handleDelete}
            icon={AiOutlineDelete}
            label="Delete"
            className="text-red-500 dark:text-red-400"
          />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SidebarChatMenu;
