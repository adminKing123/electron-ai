import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import useUserStore from "../store/useUserStore";
import ROUTES from "../router/routes";

const MainLayout = () => {
  const user = useUserStore(state => state.user);
  if (user)
    return (
      <div className="bg-[#ffffff] dark:bg-[#212121] w-screen h-[100dvh] flex">
        <Sidebar />
        <div className="w-full min-w-0 h-full flex-grow relative">
          <Header />
          <div className="h-[calc(100%-64px)]">
            <Outlet />
          </div>
        </div>
      </div>
    );
  return <Navigate to={ROUTES.AUTH} />;
};

export default MainLayout;
