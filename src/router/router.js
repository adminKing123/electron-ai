import { lazy } from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import MainLayout from "../page_layouts/MainLayout";
import AuthorizationPage from "../pages/AuthorizationPage";
import ROUTES from "./routes";
import CheckConfigs from "../page_layouts/CheckConfigs";
import NewChatPage from "../pages/NewChatPage";
import ChatPage from "../pages/ChatPage";
import LibraryPage from "../pages/Library";

const AuraRjPage  = lazy(() => import("../pages/AuraRjPage"));
const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage"));
const FusePage    = lazy(() => import("../pages/FusePage"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CheckConfigs />}>
          <Route path={ROUTES.AUTH} element={<AuthorizationPage />} />
          <Route element={<MainLayout />}>
            <Route path={ROUTES.INDEX} element={<NewChatPage />} />
            <Route path={ROUTES.CHAT_PAGE} element={<ChatPage />} />
          </Route>
          <Route element={<MainLayout type="library" />}>
            <Route path={ROUTES.LIBRARY} element={<LibraryPage />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          </Route>

          {/* Fuse — standalone layout, mirrors AuraRJ pattern */}
          <Route path={ROUTES.FUSE} element={<FusePage />}>
            {/* Register child flow routes here, e.g.: */}
            {/* <Route path="my-flow" element={<MyFlowPage />} /> */}
          </Route>

          <Route path={ROUTES.AURA_RJ} element={<AuraRjPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
