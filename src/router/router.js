import { lazy } from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import MainLayout from "../page_layouts/MainLayout";
import AuthorizationPage from "../pages/AuthorizationPage";
import ROUTES from "./routes";
import CheckConfigs from "../page_layouts/CheckConfigs";
import NewChatPage from "../pages/NewChatPage";
import ChatPage from "../pages/ChatPage";
import LibraryPage from "../pages/Library";
import FusesPageListing from "../pages/FusesPageListing";
import PageSeo from "../seo/usePageSeo";

const CometRjPage         = lazy(() => import("../pages/CometRjPage"));
const AnalyticsPage       = lazy(() => import("../pages/AnalyticsPage"));
const FusePage            = lazy(() => import("../pages/FusePage"));
const FuseStudioPage      = lazy(() => import("../pages/FuseStudioPage"));
const FuseVersionStudioPage = lazy(() => import("../pages/FuseVersionStudioPage"));
const WorkflowRunsPage    = lazy(() => import("../pages/WorkflowRunsPage"));
const WorkflowRunDetailPage = lazy(() => import("../pages/WorkflowRunDetailPage"));
const FuseIntegrationsPage = lazy(() => import("../pages/FuseIntegrationsPage"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <PageSeo />
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

          {/* Fuse — standalone layout, mirrors Comet RJ pattern */}
          <Route path={ROUTES.FUSE} element={<FusePage />} />
          <Route path={ROUTES.FUSE_STUDIO_VERSION} element={<FuseVersionStudioPage />} />
          <Route path={ROUTES.FUSE_STUDIO} element={<FuseStudioPage />} />
          <Route path={ROUTES.FUSE_RUNS} element={<WorkflowRunsPage />} />
          <Route path={ROUTES.FUSE_RUN_DETAIL} element={<WorkflowRunDetailPage />} />
          <Route path={ROUTES.FUSES_LISTING} element={<FusesPageListing />} />
          <Route path={ROUTES.FUSE_INTEGRATIONS} element={<FuseIntegrationsPage />} />

          <Route path={ROUTES.COMET_RJ} element={<CometRjPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
