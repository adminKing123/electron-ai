import { lazy } from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import MainLayout from "../page_layouts/MainLayout";
import AuthorizationPage from "../pages/AuthorizationPage";
import ROUTES from "./routes";
import CheckLogin from "../page_layouts/CheckLogin";
import NewChatPage from "../pages/NewChatPage";
import ChatPage from "../pages/ChatPage";
import LibraryPage from "../pages/Library";

const AuraRjPage = lazy(() => import("../pages/AuraRjPage"));
const CodigoPage = lazy(() => import("../pages/CodigoPage"));
const LiveChatWithAIPage = lazy(() => import("../pages/LiveChatWithAIPage"));

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
          <Route element={<MainLayout type="library" />}>
            <Route path={ROUTES.LIBRARY} element={<LibraryPage />} />
          </Route>

          <Route path={ROUTES.AURA_RJ} element={<AuraRjPage />} />
          <Route path={ROUTES.CODIGO} element={<CodigoPage />} />
          <Route path={ROUTES.LIVE_CHAT_WITH_AI} element={<LiveChatWithAIPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
