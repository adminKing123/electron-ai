import { Route, BrowserRouter, Routes } from "react-router-dom";
import MainLayout from "../page_layouts/MainLayout";
import AuthorizationPage from "../pages/AuthorizationPage";
import ROUTES from "./routes";
import CheckLogin from "../page_layouts/CheckLogin";
import NewChatPage from "../pages/NewChatPage";
import ChatPage from "../pages/ChatPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CheckLogin />}>
          <Route path={ROUTES.AUTH} element={<AuthorizationPage />} />
          <Route element={<MainLayout />}>
            <Route path={ROUTES.INDEX} element={<NewChatPage />} />
            <Route path={ROUTES.CHAT_PAGE} element={<ChatPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
