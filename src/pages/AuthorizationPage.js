import AuthorizationHeader from "../components/AuthorizationHeader";
import { SiElectron } from "react-icons/si";
import GoogleSignInButton from "../components/Buttons/GoogleSignInButton";

const AuthorizationPage = () => {
  return (
    <div className="bg-[#212121] w-screen h-[100dvh] flex overflow-auto">
      <div className="h-full flex-grow relative">
        <AuthorizationHeader />
        <div className="max-w-[800px] pt-24 px-5 md:px-0 md:mx-auto">
          <div className="flex justify-center mb-8">
            <SiElectron className="text-white w-[72px] h-[72px]" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl text-white font-semibold mb-1">
              Authorization Required
            </h2>
            <p className="text-[#aaa] text-sm">
              To continue using <b>ElectronAI</b>
            </p>
          </div>
          <div className="flex justify-center mt-6">
            <GoogleSignInButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorizationPage;
