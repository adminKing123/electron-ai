import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="bg-[#212121] w-screen h-[100dvh] flex">
      <div className="sidebar h-full w-[260px] border flex-shrink-0"></div>
      <div className="h-full flex-grow relative">
        <header className="h-[56px] w-full border mb-2"></header>
        <div className="h-[calc(100%-64px)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
