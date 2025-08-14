import useMainSideLayoutStore from "../../store/useMainSideLayoutStore";
import EditorSideLayout from "./EditorSideLayout";
import SourcesSideLayout from "./SourcesSideLayout";
import { AnimatePresence } from "framer-motion";

const MainSideLayout = () => {
  const data = useMainSideLayoutStore((state) => state.data);

  const COMPONENTS = {
    sources: SourcesSideLayout,
    editor: EditorSideLayout,
  };

  const Component = COMPONENTS?.[data?.type];

  return (
    <AnimatePresence>
      {Component ? <Component data={data} /> : null}
    </AnimatePresence>
  );
};

export default MainSideLayout;
