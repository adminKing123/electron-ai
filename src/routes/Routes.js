import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import GenerateImage from "../pages/GenerateImage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GenerateImage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
