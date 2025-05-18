import { Route, BrowserRouter, Routes } from "react-router-dom";
import GenerationPage from "../pages/GenerationPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GenerationPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
