import { Route, BrowserRouter, Routes } from "react-router-dom";
import GenerationPage from "../pages/GenerationPage";
import MainLayout from "../page_layouts/MainLayout";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<GenerationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
