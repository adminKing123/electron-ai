import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import useUserStore from "../store/useUserStore";
import ROUTES from "../router/routes";
import MainSideLayout from "../components/MainSideLayout";
import MainModalLayout from "../components/MainModalLayout";

const MainLayout = ({ type = "chat" }) => {
  const user = useUserStore((state) => state.user);
  if (user)
    return (
      <div className="bg-[#ffffff] dark:bg-[#212121] w-screen h-[100dvh] flex">
        <Sidebar />
        <div className="w-full min-w-0 h-full flex-grow relative">
          <Header type={type} />
          <div className="h-[calc(100%-64px)]">
            <Outlet />
          </div>
        </div>
        <MainSideLayout />
        <MainModalLayout />
      </div>
    );
  return <Navigate to={ROUTES.AUTH} />;
};

export default MainLayout;
