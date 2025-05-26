import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const MainLayout = () => {
  return (
    <div className="bg-[#212121] w-screen h-[100dvh] flex">
      <Sidebar />
      <div className="w-full min-w-0 h-full flex-grow relative">
        <Header />
        <div className="h-[calc(100%-64px)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
