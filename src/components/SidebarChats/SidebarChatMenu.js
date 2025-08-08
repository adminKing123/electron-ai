import { SlOptions } from "react-icons/sl";
import { AiOutlineDelete } from "react-icons/ai";
import { PiShareBold } from "react-icons/pi";
import { FiEdit2 } from "react-icons/fi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import DropdownMenuButton from "../Dropdown/DropdownMenuButton";

const SidebarChatMenu = ({ chat }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    console.log("Menu item clicked", chat);
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className="flex-shrink-0 py-[7px] px-[10px] opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100"
        >
          <SlOptions />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="text-white min-w-[120px] bg-[#353535] rounded-2xl p-[6px] shadow-lg z-50">
          <DropdownMenuButton
            onClick={handleClick}
            icon={PiShareBold}
            label="Share"
          />
          <DropdownMenuButton
            onClick={handleClick}
            icon={FiEdit2}
            label="Rename"
          />
          <DropdownMenu.Separator className="h-px mx-2 bg-[#535353] my-1" />
          <DropdownMenuButton
            onClick={handleClick}
            icon={AiOutlineDelete}
            label="Delete"
            className="text-red-400"
          />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SidebarChatMenu;
