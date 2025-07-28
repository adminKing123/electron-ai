import useMainSideLayoutStore from "../../store/useMainSideLayoutStore";
import SourcesSideLayout from "./SourcesSideLayout";

const MainSideLayout = () => {
  const data = useMainSideLayoutStore((state) => state.data);

  if (data?.type === "sources") return <SourcesSideLayout />;
  else return null;
};

export default MainSideLayout;
