import AuthorizationHeader from "../components/AuthorizationHeader";
import { TbGalaxy } from "react-icons/tb";
import GoogleSignInButton from "../components/Buttons/GoogleSignInButton";
import useUserStore from "../store/useUserStore";
import { Navigate } from "react-router-dom";
import ROUTES from "../router/routes";

const AuthorizationPage = () => {
  const user = useUserStore((state) => state.user);

  if (user) return <Navigate to={ROUTES.INDEX} />;
  return (
    <div className="bg-[#ffffff] dark:bg-[#212121] w-screen h-[100dvh] flex overflow-auto">
      <div className="h-full flex-grow relative">
        <AuthorizationHeader />
        <div className="max-w-[800px] pt-24 px-5 md:px-0 md:mx-auto">
          <div className="flex justify-center mb-8">
            <TbGalaxy className="text-[#000000] dark:text-white w-[72px] h-[72px]" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl text-[#000000] dark:text-white font-semibold mb-1">
              Authorization Required
            </h2>
            <p className="text-[#aaa] text-sm">
              To continue using <b>Spiral</b>
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
