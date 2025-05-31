import useUserStore from "../../store/useUserStore";
import { SiInfluxdb } from "react-icons/si";
import { LuSettings2 } from "react-icons/lu";
import { MdSettings } from "react-icons/md";
import { MdLogout } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import ROUTES from "../../router/routes";

const HeaderUserProfileOptionsEmail = () => {
  const { user } = useUserStore();

  return (
    <div className="text-[#838383] dark:text-[#C8C8C8] text-[14px] px-4 pt-1 pb-2">
      {user.email}
    </div>
  );
};

const OptionButton = ({ icon: Icon, label, ...props }) => {
  return (
    <li>
      <button
        className="flex text-[#000000] dark:text-[#C8C8C8] items-center gap-2 w-full hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3A] rounded-lg px-2 py-1 text-[14px] h-8"
        {...props}
      >
        <div>
          <Icon />
        </div>
        <div>{label}</div>
      </button>
    </li>
  );
};

const LogoutOption = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location = ROUTES.AUTH;
    } catch (error) {}
  };

  return <OptionButton icon={MdLogout} label="Logout" onClick={handleLogout} />;
};

const HeaderUserProfileOptions = () => {
  return (
    <div className="absolute w-[280px] shadow-xl right-0 top-8 rounded-xl z-10 border border-[#E1E1E1] dark:border-[#2F2F2F] bg-[#ffffff] dark:bg-[#2F2F2F] py-2">
      <HeaderUserProfileOptionsEmail />
      <hr className="border-[#E6E6E6] dark:border-[#ffffff26] mx-4 my-1" />
      <div className="px-2">
        <ul className="max-h-[360px] overflow-y-auto">
          <OptionButton icon={SiInfluxdb} label="Upgrade Plan" />
          <OptionButton icon={LuSettings2} label="Customize ElectronAI" />
          <OptionButton icon={MdSettings} label="Settings" />
          <hr className="border-[#E6E6E6] dark:border-[#ffffff26] mx-2 my-2" />
          <LogoutOption />
        </ul>
      </div>
    </div>
  );
};

const HeaderUserProfile = () => {
  const dropdownRef = useRef(null);
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative w-7 h-7" ref={dropdownRef}>
      {isOpen ? <HeaderUserProfileOptions /> : null}
      <button
        onClick={toggleOptions}
        className="w-7 h-7 rounded-full overflow-hidden"
      >
        <img
          alt={user.displayName}
            src={user.photoURL}
          className="w-full h-full object-cover"
        />
      </button>
    </div>
  );
};

export default HeaderUserProfile;
