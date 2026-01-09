import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import useUserStore from "../../store/useUserStore";
import { SiInfluxdb } from "react-icons/si";
import { LuSettings2 } from "react-icons/lu";
import { MdSettings, MdLogout } from "react-icons/md";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import ROUTES from "../../router/routes";
import ThemeChangeOption from "../ThemeChangeOption";

const HeaderUserProfile = () => {
  const user = useUserStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location = ROUTES.AUTH;
    } catch (error) {}
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button className="w-7 h-7 rounded-full overflow-hidden outline-none">
          <img
            alt={user.displayName}
            src={user.photoURL}
            className="w-full h-full object-cover"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-[280px] shadow-xl rounded-xl z-10 border border-[#E1E1E1] dark:border-[#2F2F2F] bg-[#ffffff] dark:bg-[#2F2F2F] py-2"
          sideOffset={8}
          align="end"
        >
          <div className="text-[#838383] dark:text-[#C8C8C8] text-[14px] px-4 pt-1 pb-2">
            {user.email}
          </div>

          <DropdownMenu.Separator className="h-px bg-[#E6E6E6] dark:bg-[#ffffff26] mx-4 my-1" />

          <div className="px-2">
            <DropdownMenu.Item className="flex text-[#000000] dark:text-[#C8C8C8] items-center gap-2 w-full hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3A] rounded-lg px-2 py-1 text-[14px] h-8 outline-none cursor-pointer">
              <SiInfluxdb />
              <span>Upgrade Plan</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item className="flex text-[#000000] dark:text-[#C8C8C8] items-center gap-2 w-full hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3A] rounded-lg px-2 py-1 text-[14px] h-8 outline-none cursor-pointer">
              <LuSettings2 />
              <span>Customize Spiral</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <ThemeChangeOption />
            </DropdownMenu.Item>

            <DropdownMenu.Item className="flex text-[#000000] dark:text-[#C8C8C8] items-center gap-2 w-full hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3A] rounded-lg px-2 py-1 text-[14px] h-8 outline-none cursor-pointer">
              <MdSettings />
              <span>Settings</span>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-[#E6E6E6] dark:bg-[#ffffff26] mx-2 my-2" />

            <DropdownMenu.Item
              className="flex text-[#000000] dark:text-[#C8C8C8] items-center gap-2 w-full hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3A] rounded-lg px-2 py-1 text-[14px] h-8 outline-none cursor-pointer"
              onSelect={handleLogout}
            >
              <MdLogout />
              <span>Logout</span>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default HeaderUserProfile;
