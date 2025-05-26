import { Route, BrowserRouter, Routes } from "react-router-dom";
import GenerationPage from "../pages/GenerationPage";
import MainLayout from "../page_layouts/MainLayout";
import AuthorizationPage from "../pages/AuthorizationPage";
import ROUTES from "./routes";
import CheckLogin from "../page_layouts/CheckLogin";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CheckLogin />}>
          <Route path={ROUTES.AUTH} element={<AuthorizationPage />} />
          <Route element={<MainLayout />}>
            <Route path={ROUTES.INDEX} element={<GenerationPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
