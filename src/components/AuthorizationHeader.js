import { TbGalaxy } from "react-icons/tb";

const AuthorizationHeader = () => {
  return (
    <header className="h-[56px] w-full flex items-center justify-between gap-2 px-3 mb-[1px]">
      <div className="flex items-center">
        <button className="text-xl text-[#000000] dark:text-white font-semibold py-1.5 px-3 rounded-lg flex items-center gap-2">
          <TbGalaxy />
          Electron AI
        </button>
      </div>
    </header>
  );
};

export default AuthorizationHeader;
