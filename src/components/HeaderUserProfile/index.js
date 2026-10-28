import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import useUserStore from "../../store/useUserStore";
import { SiInfluxdb } from "react-icons/si";
import { LuSettings2 } from "react-icons/lu";
import { MdSettings, MdLogout } from "react-icons/md";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import ROUTES from "../../router/routes";
import ThemeChangeOption from "../ThemeChangeOption";

/** Shared menu item style */
const itemCls =
  "flex items-center gap-2.5 w-full px-2.5 py-[7px] text-[13px] rounded-xl outline-none cursor-pointer transition-colors " +
  "text-ink-750 dark:text-ink-300 " +
  "hover:bg-ink-50 dark:hover:bg-void-750";

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
        <button className="w-[30px] h-[30px] rounded-full overflow-hidden outline-none ring-2 ring-transparent hover:ring-ink-200 dark:hover:ring-void-650 transition-all">
          <img
            alt={user.displayName}
            src={user.photoURL}
            className="w-full h-full object-cover"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="w-[260px] z-50 p-1.5 rounded-2xl
            border border-ink-150 dark:border-void-725
            bg-white dark:bg-void-800
            shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
          {/* User identity block */}
          <div className="flex items-center gap-3 px-3 py-2.5 mb-0.5">
            <img
              alt={user.displayName}
              src={user.photoURL}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink-975 dark:text-white truncate leading-tight">
                {user.displayName}
              </p>
              <p className="text-[11px] text-ink-400 dark:text-ink-550 truncate leading-tight">
                {user.email}
              </p>
            </div>
          </div>

          <DropdownMenu.Separator className="h-px bg-ink-100 dark:bg-void-750 mx-1 mb-1" />

          <div className="flex flex-col gap-px">
            <DropdownMenu.Item asChild>
              <ThemeChangeOption />
            </DropdownMenu.Item>
            
            <DropdownMenu.Item className={itemCls}>
              <SiInfluxdb className="w-[14px] h-[14px] opacity-60 flex-shrink-0" />
              <span>Upgrade Plan</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item className={itemCls}>
              <LuSettings2 className="w-[14px] h-[14px] opacity-60 flex-shrink-0" />
              <span>Customize Comet AI</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item className={itemCls}>
              <MdSettings className="w-[14px] h-[14px] opacity-60 flex-shrink-0" />
              <span>Settings</span>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-ink-100 dark:bg-void-750 mx-1 my-1" />

            <DropdownMenu.Item
              className={`${itemCls} hover:text-red-500 dark:hover:text-red-400`}
              onSelect={handleLogout}
            >
              <MdLogout className="w-[14px] h-[14px] opacity-60 flex-shrink-0" />
              <span>Log out</span>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default HeaderUserProfile;
