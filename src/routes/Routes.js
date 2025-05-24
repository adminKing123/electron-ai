import { Route, BrowserRouter, Routes } from "react-router-dom";
import GenerationPage from "../pages/GenerationPage";
import MainLayout from "../page_layouts/MainLayout";
import AuthorizationPage from "../pages/AuthorizationPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthorizationPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<GenerationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
