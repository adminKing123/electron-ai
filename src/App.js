import AppRoutes from "./router/router";
import "./App.css";
import ThemeHandler from "./components/ThemeHandler";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <ToastContainer style={{}} toastStyle={{}} />
      <ThemeHandler />
      <AppRoutes />
    </>
  );
}

export default App;
