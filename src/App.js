import AppRoutes from "./router/router";
import "./App.css";
import ThemeHandler from "./components/ThemeHandler";
import { ToastContainer } from "react-toastify";
import ServerHealthCheck from "./components/ServerHealthCheck";

function App() {
  return (
    <>
      <ToastContainer style={{}} toastStyle={{}} />
      <ThemeHandler />
      <ServerHealthCheck>
        <AppRoutes />
      </ServerHealthCheck>
    </>
  );
}

export default App;
