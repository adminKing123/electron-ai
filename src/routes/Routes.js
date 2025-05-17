import { Route, BrowserRouter, Routes } from "react-router-dom";
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
