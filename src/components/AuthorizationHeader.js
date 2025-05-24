import { SiElectron } from "react-icons/si";

const AuthorizationHeader = () => {
  return (
    <header className="h-[56px] w-full flex items-center justify-between gap-2 px-3 mb-[1px]">
      <div className="flex items-center">
        <button className="text-xl text-white font-semibold py-1.5 px-3 rounded-lg flex items-center gap-2">
          <SiElectron />
          ElectronAI
        </button>
      </div>
    </header>
  );
};

export default AuthorizationHeader;
